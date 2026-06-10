import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "barkbuddy_dev_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email:  string;
}

export const signToken = (payload: JWTPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);

export const verifyToken = (token: string): JWTPayload =>
  jwt.verify(token, SECRET) as JWTPayload;