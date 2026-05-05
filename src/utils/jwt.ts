import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET! as jwt.Secret;

export const signToken = (payload: object, EXPIRES_IN: string): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(
    payload,
    JWT_SECRET as string,
    {
      expiresIn: EXPIRES_IN,
      algorithm: "HS512", // strong algorithm
    } as any,
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET as string);
};
