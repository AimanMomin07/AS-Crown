import {
  Response
} from "express";

import pool from "../config/database.js";

import {
  comparePassword,
  hashPassword
} from "../utils/password.js";


/* =========================================================
   GET MY PROFILE
========================================================= */

export async function getMyProfile(
  req: any,
  res: Response
) {

  try {

    const userId =
      Number(
        req.user?.id
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    const [
      rows
    ] =
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
          u.created_at,

          r.name AS role_name,

          mp.ownership_type,
          mp.lease_start_date,
          mp.lease_end_date

        FROM users u

        INNER JOIN roles r
          ON r.id = u.role_id

        LEFT JOIN member_profiles mp
          ON mp.user_id = u.id

        WHERE
          u.id = ?

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
        success: false,
        message:
          "Profile not found"
      });

    }


    const user =
      users[0];


    return res.json({

      success: true,

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
            user.mobile ||
            user.phone ||
            null,

          phone:
            user.phone ||
            null,

          profileImage:
            user.profile_image ||
            null,

          status:
            user.status,

          role:
            user.role_name,

          createdAt:
            user.created_at,

          ownershipType:
            user.ownership_type ||
            null,

          leaseStartDate:
            user.lease_start_date ||
            null,

          leaseEndDate:
            user.lease_end_date ||
            null

        }

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve profile"
    });

  }

}


/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export async function updateMyProfile(
  req: any,
  res: Response
) {

  try {

    const userId =
      Number(
        req.user?.id
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
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

      WHERE
        id = ?
      `,
      [
        firstName,
        lastName ||
          null,
        mobile ||
          null,
        userId
      ]
    );


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          mobile,
          phone,
          profile_image,
          status

        FROM users

        WHERE
          id = ?

        LIMIT 1
        `,
        [
          userId
        ]
      );


    const user =
      (rows as any[])[0];


    return res.json({

      success:
        true,

      message:
        "Profile updated successfully",

      data: {

        user: user
          ? {

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

              phone:
                user.phone,

              profileImage:
                user.profile_image,

              status:
                user.status

            }
          : null

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Update profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile"
    });

  }

}


/* =========================================================
   UPLOAD MY PROFILE PHOTO
========================================================= */

export async function uploadMyProfilePhoto(
  req: any,
  res: Response
) {

  try {

    const userId =
      Number(
        req.user?.id
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });

    }


    if (
      !req.file
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Profile image is required"
      });

    }


    const imageUrl =
      `/uploads/profile/${req.file.filename}`;


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
        imageUrl,
        userId
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Profile photo updated successfully",

      data: {

        profileImage:
          imageUrl

      }

    });

  } catch (
    error
  ) {

    console.error(
      "Upload profile photo error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to upload profile photo"

    });

  }

}


/* =========================================================
   CHANGE MY PASSWORD
========================================================= */

export async function changeMyPassword(
  req: any,
  res: Response
) {

  try {

    const userId =
      Number(
        req.user?.id
      );


    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          "Authentication required"

      });

    }


    const currentPassword =
      String(
        req.body?.currentPassword ||
        ""
      );


    const newPassword =
      String(
        req.body?.newPassword ||
        ""
      );


    const confirmPassword =
      String(
        req.body?.confirmPassword ||
        ""
      );


    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Current password, new password and confirmation are required"

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


    if (
      newPassword !==
      confirmPassword
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "New passwords do not match"

      });

    }


    if (
      currentPassword ===
      newPassword
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "New password must be different from your current password"

      });

    }


    const [
      rows
    ] =
      await pool.execute(
        `
        SELECT
          password

        FROM users

        WHERE
          id = ?

        LIMIT 1
        `,
        [
          userId
        ]
      );


    const user =
      (
        rows as any[]
      )[0];


    if (
      !user ||
      !user.password
    ) {

      return res.status(404).json({

        success:
          false,

        message:
          "User account could not be verified"

      });

    }


    const validCurrentPassword =
      await comparePassword(
        currentPassword,
        String(
          user.password
        )
      );


    if (
      !validCurrentPassword
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          "Current password is incorrect"

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
        password = ?,
        updated_at =
          CURRENT_TIMESTAMP

      WHERE
        id = ?
      `,
      [
        passwordHash,
        userId
      ]
    );


    return res.json({

      success:
        true,

      message:
        "Password changed successfully"

    });

  } catch (
    error
  ) {

    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({

      success:
        false,

      message:
        "Unable to change password"

    });

  }

}
