// src/middleware/auth.middleware.ts
import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token ;

  if (!token) {
    res.status(401).redirect("/auth/login");
    return;
  }

//   const token: string = authHeader.split(" ")[1] as string;
//     console.log("token "+token);

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).redirect("/auth/login");
    return;
  }
};
