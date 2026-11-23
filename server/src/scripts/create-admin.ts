import pool from "../config/database.js";
import {
  hashPassword
} from "../utils/password.js";


async function createAdmin() {

  try {

    /*
    |--------------------------------------------------------------------------
    | ADMIN DETAILS
    |--------------------------------------------------------------------------
    */

    const firstName = "Aiman";

    const lastName = "Momin";

    const email =
      "admin@ascrown.com";

    const mobile =
      "9876543212";

    const password =
      "Aiman123";


    /*
    |--------------------------------------------------------------------------
    | GET ADMIN ROLE
    |--------------------------------------------------------------------------
    */

    const [roleRows] =
      await pool.execute(
        `
        SELECT id
        FROM roles
        WHERE LOWER(name) = 'admin'
        LIMIT 1
        `
      );


    const roles =
      roleRows as any[];


    if (roles.length === 0) {

      throw new Error(
        "Admin role not found"
      );

    }


    const adminRoleId =
      roles[0].id;


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING ACCOUNT
    |--------------------------------------------------------------------------
    */

    const [existingRows] =
      await pool.execute(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );


    if (
      (existingRows as any[]).length > 0
    ) {

      console.log(
        "Admin account already exists."
      );

      process.exit(0);

    }


    /*
    |--------------------------------------------------------------------------
    | HASH PASSWORD
    |--------------------------------------------------------------------------
    */

    const passwordHash =
      await hashPassword(
        password
      );


    /*
    |--------------------------------------------------------------------------
    | CREATE ADMIN
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
        (?, ?, ?, ?, ?, ?, 'active')
        `,
        [
          adminRoleId,
          firstName,
          lastName,
          email,
          mobile,
          passwordHash
        ]
      );


    console.log(
      "================================"
    );

    console.log(
      "AS CROWN ADMIN CREATED"
    );

    console.log(
      "================================"
    );

    console.log(
      "ID:",
      (result as any).insertId
    );

    console.log(
      "Name:",
      `${firstName} ${lastName}`
    );

    console.log(
      "Email:",
      email
    );

    console.log(
      "Mobile:",
      mobile
    );

    console.log(
      "Password:",
      password
    );

    console.log(
      "Role: admin"
    );

    console.log(
      "================================"
    );


    process.exit(0);

  } catch (error) {

    console.error(
      "Failed to create admin:",
      error
    );

    process.exit(1);

  }

}


createAdmin();