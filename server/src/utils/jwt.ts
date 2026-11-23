import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const configuredSecret = process.env.JWT_SECRET?.trim();

if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET must be configured in production.");
}

const JWT_SECRET = configuredSecret || "development-secret";

export interface JwtPayload {
  id: number;

  role:
    | "admin"
    | "resident"
    | "staff"
    | "security"
    | "committee";
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}