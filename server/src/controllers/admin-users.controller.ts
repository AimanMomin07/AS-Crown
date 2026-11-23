import { Request, Response } from "express";
import pool from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import path from "path";
import fs from "fs";
import { ensureRoleCommunityMembership } from "../utils/community-groups.js";
export async function uploadAdminProfileImage(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(
        req.params.id
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        success:
          false,
        message:
          "Invalid user ID"
      });

    }

    if (
      !req.file
    ) {

      return res.status(400).json({
        success:
          false,
        message:
          "Profile image is required"
      });

    }

    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          profile_image
        FROM users
        WHERE
          id = ?
        LIMIT 1
        `,
        [
          userId
        ]
      );

    const users =
      rows as any[];

    if (
      users.length === 0
    ) {

      return res.status(404).json({
        success:
          false,
        message:
          "User not found"
      });

    }

    const oldImage =
      users[0]
        ?.profile_image;

    await pool.execute(
      `
      UPDATE users
      SET
        profile_image = ?,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE
        id = ?
      `,
      [
        `/uploads/profile/${req.file.filename}`,
        userId
      ]
    );

    /*
     * Delete old local profile image
     * when applicable.
     */
    if (
      oldImage &&
      String(
        oldImage
      ).startsWith(
        "/uploads/profile/"
      )
    ) {

      const oldPath =
        path.join(
          process.cwd(),
          oldImage.replace(
            /^\//,
            ""
          )
        );

      if (
        fs.existsSync(
          oldPath
        )
      ) {

        fs.unlinkSync(
          oldPath
        );

      }

    }

    return res.json({

      success:
        true,

      message:
        "Profile photo updated successfully",

      data: {

        profileImage:
          `/uploads/profile/${req.file.filename}`

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Admin profile image error:",
      error
    );

    return res.status(500).json({
      success:
        false,
      message:
        "Unable to update profile photo"
    });

  }

}
/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

export async function getUsers(
  req: Request,
  res: Response
) {

  try {

    const search =
      String(
        req.query.search || ""
      ).trim();


    const role =
      String(
        req.query.role || ""
      ).trim();


    const status =
      String(
        req.query.status || ""
      ).trim();


    const page =
      Math.max(
        Number(req.query.page) || 1,
        1
      );


    const limit =
      Math.min(
        Math.max(
          Number(req.query.limit) || 20,
          1
        ),
        100
      );


    const offset =
      (page - 1) * limit;


    const conditions: string[] = [];

    const params: any[] = [];


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search) {

      conditions.push(`
        (
          u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR u.email LIKE ?
          OR u.mobile LIKE ?
        )
      `);

      const value =
        `%${search}%`;

      params.push(
        value,
        value,
        value,
        value
      );

    }


    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    if (role) {

      conditions.push(
        "r.name = ?"
      );

      params.push(
        role
      );

    }


    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    if (status) {

      conditions.push(
        "u.status = ?"
      );

      params.push(
        status
      );

    }


    const where =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";


    /*
    |--------------------------------------------------------------------------
    | COUNT
    |--------------------------------------------------------------------------
    */

    const [countRows] =
      await pool.execute(
        `
        SELECT
          COUNT(*) AS total

        FROM users u

        LEFT JOIN roles r
          ON r.id = u.role_id

        ${where}
        `,
        params
      );


    const total =
      Number(
        (countRows as any[])[0]
          ?.total || 0
      );


    /*
    |--------------------------------------------------------------------------
    | USERS
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

          r.id AS role_id,

          r.name AS role_name,

          r.description AS role_description

        FROM users u

        LEFT JOIN roles r
          ON r.id = u.role_id

        ${where}

        ORDER BY
          u.created_at DESC

        LIMIT ?
        OFFSET ?
        `,
        [
          ...params,
          limit,
          offset
        ]
      );


    return res.json({

      success: true,

      data: {

        users:
          rows,

        pagination: {

          page,

          limit,

          total,

          totalPages:
            Math.ceil(
              total / limit
            )

        }

      }

    });

  }

  catch (error) {

    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve users"

    });

  }

}


/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

export async function getUserById(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(req.params.id);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid user ID"

      });

    }


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

          u.is_email_verified,

          u.is_phone_verified,

          u.status,

          u.google_id,

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

        LEFT JOIN roles r
          ON r.id = u.role_id

        LEFT JOIN member_profiles mp
          ON mp.user_id = u.id

        WHERE u.id = ?

        LIMIT 1
        `,
        [userId]
      );


    const users =
      rows as any[];


    if (
      users.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }


    return res.json({

      success: true,

      data: {

        user:
          users[0]

      }

    });

  }

  catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to retrieve user"

    });

  }

}


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

export async function createUser(
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

      roleId,

      status = "active"

    } = req.body;


    if (
      !firstName ||
      !password ||
      !roleId
    ) {

      return res.status(400).json({

        success: false,

        message:
          "First name, password and role are required"

      });

    }


    if (
      password.length < 8
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Password must contain at least 8 characters"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | CHECK ROLE
    |--------------------------------------------------------------------------
    */

    const [roleRows] =
      await pool.execute(
        `
        SELECT id, name
        FROM roles
        WHERE id = ?
        LIMIT 1
        `,
        [roleId]
      );


    const roles =
      roleRows as any[];


    if (
      roles.length === 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid role"

      });

    }


    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE
    |--------------------------------------------------------------------------
    */

    const [existingRows] =
      await pool.execute(
        `
        SELECT id

        FROM users

        WHERE
          (
            email IS NOT NULL
            AND email = ?
          )

          OR

          (
            mobile IS NOT NULL
            AND mobile = ?
          )

        LIMIT 1
        `,
        [
          email || null,
          mobile || null
        ]
      );


    if (
      (existingRows as any[])
        .length > 0
    ) {

      return res.status(409).json({

        success: false,

        message:
          "Email or mobile already exists"

      });

    }


    const passwordHash =
      await hashPassword(
        password
      );


    /*
    |--------------------------------------------------------------------------
    | INSERT
    |--------------------------------------------------------------------------
    */

    const [result] =
      await pool.execute(
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

        VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          roleId,
          firstName,
          lastName || null,
          email || null,
          mobile || null,
          passwordHash,
          status
        ]
      );


    const userId =
      (result as any)
        .insertId;

    await ensureRoleCommunityMembership(
      Number(userId),
      String(roles[0].name).toLowerCase()
    );


    return res.status(201).json({

      success: true,

      message:
        "User created successfully",

      data: {

        userId,

        role:
          roles[0].name

      }

    });

  }

  catch (error) {

    console.error(
      "Create user error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to create user"

    });

  }

}


/*
|--------------------------------------------------------------------------
| UPDATE USER STATUS
|--------------------------------------------------------------------------
*/
export async function updateAdminUser(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(
        req.params.id
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID"
      });

    }


    const firstName =
      String(
        req.body?.firstName ||
        ""
      ).trim();


    const lastName =
      String(
        req.body?.lastName ||
        ""
      ).trim();


    const mobile =
      String(
        req.body?.mobile ||
        ""
      ).trim();


    if (
      !firstName
    ) {

      return res.status(400).json({
        success: false,
        message:
          "First name is required"
      });

    }


    await pool.execute(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        mobile = ?,
        updated_at =
          CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        firstName,
        lastName || null,
        mobile || null,
        userId
      ]
    );


    return res.json({
      success: true,
      message:
        "Profile updated successfully"
    });

  } catch (error) {

    console.error(
      "Update admin user error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile"
    });

  }

}

export async function updateUserStatus(
  req: Request,
  res: Response
) {

  try {

    const userId =
      Number(req.params.id);


    const {
      status
    } = req.body;


    const validStatuses = [
      "active",
      "inactive",
      "blocked",
      "pending"
    ];


    if (
      !validStatuses.includes(
        status
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid account status"

      });

    }


    const [result] =
      await pool.execute(
        `
        UPDATE users

        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = ?
        `,
        [
          status,
          userId
        ]
      );


    if (
      (result as any)
        .affectedRows === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }


    return res.json({

      success: true,

      message:
        "User status updated successfully"

    });

  }

  catch (error) {

    console.error(
      "Update user status error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to update user status"

    });

  }

}