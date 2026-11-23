import { Request, Response } from "express";
import pool from "../config/database.js";

import {
  hashPassword,
  comparePassword
} from "../utils/password.js";

import { generateToken } from "../utils/jwt.js";

import { AuthenticatedRequest } from "../middleware/auth.js";

import { firebaseAdminAuth } from "../config/firebase-admin.js";
import { ensureRoleCommunityMembership } from "../utils/community-groups.js";


/*
|--------------------------------------------------------------------------
| REGISTER RESIDENT
|--------------------------------------------------------------------------
*/

export async function register(
  req: Request,
  res: Response
) {
  try {

    const {
      firstName,
      lastName,
      email,
      mobile,
      password,
      flatNumber,
      buildingName,
      wing
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!firstName || !password) {
      return res.status(400).json({
        success: false,
        message: "First name and password are required"
      });
    }


    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number is required"
      });
    }


    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters"
      });
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING EMAIL / MOBILE
    |--------------------------------------------------------------------------
    */

    const [existingUsers] = await pool.execute(
      `
      SELECT id
      FROM users
      WHERE
        (email IS NOT NULL AND email = ?)
        OR
        (mobile IS NOT NULL AND mobile = ?)
      LIMIT 1
      `,
      [
        email || null,
        mobile || null
      ]
    );


    if ((existingUsers as any[]).length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email or mobile already exists"
      });
    }


    /*
    |--------------------------------------------------------------------------
    | GET RESIDENT ROLE
    |--------------------------------------------------------------------------
    */

    const [roleRows] = await pool.execute(
      `
      SELECT id
      FROM roles
      WHERE LOWER(name) = 'resident'
      LIMIT 1
      `
    );


    const roles = roleRows as any[];


    if (roles.length === 0) {
      return res.status(500).json({
        success: false,
        message:
          "Resident role is not configured in the database"
      });
    }


    const residentRoleId = roles[0].id;


    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await hashPassword(password);


    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
    */

    const [result] = await pool.execute(
      `
      INSERT INTO users
      (
        role_id,
        first_name,
        last_name,
        email,
        mobile,
        password_hash,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        residentRoleId,
        firstName,
        lastName || null,
        email || null,
        mobile || null,
        passwordHash
      ]
    );


    const userId =
      (result as any).insertId;

    await ensureRoleCommunityMembership(
      Number(userId),
      "resident"
    );


    /*
    |--------------------------------------------------------------------------
    | CREATE MEMBER PROFILE
    |--------------------------------------------------------------------------
    */

    await pool.execute(
      `
      INSERT INTO member_profiles
      (
        user_id,
        flat_number,
        building_name,
        wing
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        flatNumber || null,
        buildingName || null,
        wing || null
      ]
    );


    /*
    |--------------------------------------------------------------------------
    | CREATE JWT
    |--------------------------------------------------------------------------
    */

    const token = generateToken({
      id: userId,
      role: "resident"
    });


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({

      success: true,

      message:
        "AS CROWN resident account created successfully",

      data: {

        user: {

          id: userId,

          firstName,

          lastName:
            lastName || null,

          email:
            email || null,

          mobile:
            mobile || null,

          role: "resident"

        },

        token

      }

    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to create account"

    });

  }
}



/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export async function login(
  req: Request,
  res: Response
) {

  try {

    const {
      identifier,
      password
    } = req.body;


    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!identifier || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Email/mobile and password are required"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */

    const [rows] = await pool.execute(
      `
      SELECT

        u.id,

        u.first_name,

        u.last_name,

        u.email,

        u.mobile,

        u.password_hash,

        u.status,

        u.role_id,

        r.name AS role_name

      FROM users u

      INNER JOIN roles r
        ON r.id = u.role_id

      WHERE
        u.email = ?
        OR
        u.mobile = ?

      LIMIT 1
      `,
      [
        identifier,
        identifier
      ]
    );


    const users =
      rows as any[];


    /*
    |--------------------------------------------------------------------------
    | USER NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (users.length === 0) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid login credentials"

      });

    }


    const user =
      users[0];


    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    if (user.status !== "active") {

      return res.status(403).json({

        success: false,

        message:
          `Account is ${user.status}`

      });

    }


    /*
    |--------------------------------------------------------------------------
    | PASSWORD CHECK
    |--------------------------------------------------------------------------
    */

    if (!user.password_hash) {

      return res.status(401).json({

        success: false,

        message:
          "This account requires another authentication method"

      });

    }


    const passwordValid =
      await comparePassword(
        password,
        user.password_hash
      );


    if (!passwordValid) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid login credentials"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | UPDATE LAST LOGIN
    |--------------------------------------------------------------------------
    */

    await pool.execute(
      `
      UPDATE users

      SET last_login_at =
        CURRENT_TIMESTAMP

      WHERE id = ?
      `,
      [
        user.id
      ]
    );


    /*
    |--------------------------------------------------------------------------
    | CREATE TOKEN
    |--------------------------------------------------------------------------
    */

    const token =
      generateToken({

        id: user.id,

        role:
          user.role_name

      });


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.json({

      success: true,

      message:
        "Login successful",

      data: {

        user: {

          id:
            user.id,

          firstName:
            user.first_name,

          lastName:
            user.last_name,

          email:
            user.email,

          mobile:
            user.mobile,

          role:
            user.role_name

        },

        token

      }

    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to login"

    });

  }

}




/*
|--------------------------------------------------------------------------
| FIREBASE PHONE PASSWORD RESET
|--------------------------------------------------------------------------
*/

function normalizeIndianMobile(
  value: unknown
) {

  const digits =
    String(
      value ||
      ""
    )
      .replace(
        /\D/g,
        ""
      );


  if (
    digits.startsWith("91") &&
    digits.length === 12
  ) {

    return digits.slice(
      2
    );

  }


  return digits.length === 10
    ? digits
    : "";

}


export async function resetPasswordWithFirebase(
  req: Request,
  res: Response
) {

  try {

    const idToken =
      String(
        req.body?.idToken ||
        ""
      ).trim();


    const newPassword =
      String(
        req.body?.newPassword ||
        ""
      );


    if (
      !idToken
    ) {

      return res.status(400).json({
        success:
          false,

        message:
          "Firebase verification token is required"
      });

    }


    if (
      newPassword.length <
      8
    ) {

      return res.status(400).json({
        success:
          false,

        message:
          "New password must contain at least 8 characters"
      });

    }


    const decodedToken =
      await firebaseAdminAuth
        .verifyIdToken(
          idToken
        );


    const firebasePhone =
      String(
        decodedToken
          .phone_number ||
        ""
      ).trim();


    if (
      !firebasePhone
    ) {

      return res.status(400).json({
        success:
          false,

        message:
          "The verified Firebase account does not contain a phone number"
      });

    }


    const mobile =
      normalizeIndianMobile(
        firebasePhone
      );


    if (
      !mobile
    ) {

      return res.status(400).json({
        success:
          false,

        message:
          "Unable to normalize the verified mobile number"
      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id
        FROM users
        WHERE
          status = 'active'
          AND mobile IS NOT NULL
          AND RIGHT(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    mobile,
                    ' ',
                    ''
                  ),
                  '-',
                  ''
                ),
                '(',
                ''
              ),
              ')',
              ''
            ),
            10
          ) = ?
        LIMIT 1
        `,
        [
          mobile
        ]
      );


    const user =
      (
        rows as any[]
      )[0];


    if (
      !user
    ) {

      return res.status(404).json({
        success:
          false,

        message:
          "No active AS CROWN account is registered with this phone number"
      });

    }


    const passwordHash =
      await hashPassword(
        newPassword
      );


    await pool.execute(
      `
      UPDATE users

      SET
        password_hash = ?,
        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        passwordHash,
        user.id
      ]
    );


    return res.json({
      success:
        true,

      message:
        "Password reset successfully. You can now sign in with your new password."
    });

  } catch (
    error
  ) {

    console.error(
      "Firebase password reset error:",
      error
    );


    return res.status(500).json({
      success:
        false,

      message:
        "Unable to reset password"
    });

  }

}


/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    /*
    |--------------------------------------------------------------------------
    | CHECK AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    if (!req.user) {

      return res.status(401).json({

        success: false,

        message:
          "Authentication required"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | GET USER + ROLE + MEMBER PROFILE
    |--------------------------------------------------------------------------
    */

    const [rows] =
      await pool.execute(

        `
        SELECT

          u.id,

          u.first_name,

          u.last_name,

          u.email,

          u.mobile,

          u.phone,

          u.profile_image,

          u.status,

          u.is_email_verified,

          u.is_phone_verified,

          u.last_login_at,

          u.created_at,

          u.updated_at,


          r.id AS role_id,

          r.name AS role_name,

          r.description AS role_description,


          mp.flat_number,

          mp.building_name,

          mp.wing,

          mp.ownership_type,

          mp.emergency_contact_name,

          mp.emergency_contact_mobile,

          mp.address,

          mp.occupation


        FROM users u


        INNER JOIN roles r

          ON r.id = u.role_id


        LEFT JOIN member_profiles mp

          ON mp.user_id = u.id


        WHERE u.id = ?


        LIMIT 1

        `,

        [
          req.user.id
        ]

      );


    const users =
      rows as any[];


    /*
    |--------------------------------------------------------------------------
    | USER NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (users.length === 0) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return res.json({

      success: true,

      data: {

        user:
          users[0]

      }

    });

  } catch (error) {

    console.error(
      "Get me error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve user"

    });

  }

}