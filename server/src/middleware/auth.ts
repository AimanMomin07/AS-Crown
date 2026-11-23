import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  verifyToken,
  JwtPayload
} from "../utils/jwt.js";


/* =========================================================
   SUPPORTED AS CROWN ROLES
========================================================= */

export type UserRole =
  | "admin"
  | "resident"
  | "staff"
  | "security"
  | "committee";


/* =========================================================
   AUTHENTICATED REQUEST
========================================================= */

export interface AuthenticatedRequest
  extends Request {

  user?: JwtPayload;

}


/* =========================================================
   AUTHENTICATE
========================================================= */

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {

  try {

    const authorization =
      req.headers.authorization;


    /* -------------------------------------------------------
       TOKEN MISSING
    ------------------------------------------------------- */

    if (!authorization) {

      return res.status(401).json({

        success: false,

        message:
          "Authentication token required"

      });

    }


    /* -------------------------------------------------------
       BEARER TOKEN
    ------------------------------------------------------- */

    const [
      type,
      token
    ] =
      authorization.split(" ");


    if (
      type !== "Bearer" ||
      !token
    ) {

      return res.status(401).json({

        success: false,

        message:
          "Invalid authorization format"

      });

    }


    /* -------------------------------------------------------
       VERIFY TOKEN
    ------------------------------------------------------- */

    const decoded =
      verifyToken(token);


    /* -------------------------------------------------------
       ATTACH USER
    ------------------------------------------------------- */

    req.user =
      decoded;


    next();

  } catch {

    return res.status(401).json({

      success: false,

      message:
        "Invalid or expired authentication token"

    });

  }

}


/* =========================================================
   AUTHORIZE BY ROLE
========================================================= */

export function authorize(
  ...roles: UserRole[]
) {

  return (

    req: AuthenticatedRequest,

    res: Response,

    next: NextFunction

  ) => {


    /* -------------------------------------------------------
       AUTHENTICATION CHECK
    ------------------------------------------------------- */

    if (!req.user) {

      return res.status(401).json({

        success: false,

        message:
          "Authentication required"

      });

    }


    /* -------------------------------------------------------
       ROLE CHECK
    ------------------------------------------------------- */

    if (
      !roles.includes(
        req.user.role as UserRole
      )
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You do not have permission to access this resource"

      });

    }


    next();

  };

}