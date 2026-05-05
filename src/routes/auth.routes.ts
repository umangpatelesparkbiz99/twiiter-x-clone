import { Router } from "express";
import { authController } from "../controller/auth.controller.ts";

const authRouter = Router();

authRouter
  .route("/register")
  .get(authController.getRegisterPagePrimary)
  .post(authController.postRegisterPagePrimary);

authRouter
  .route("/register/second/:id")
  .get(authController.getRegisterPageSecondary)
  .post(authController.postRegisterPageSecondary);

authRouter
  .route("/login")
  .get(authController.getLoginPage)
  .post(authController.postLoginPage);

authRouter.get("/foget/password", authController.getForgetPaga);

authRouter.get("/logout", authController.logout);

// Verification routes
authRouter.get("/verify/:user", authController.verifyUser);
authRouter.get("/reset/:user", authController.getOtp);

authRouter
  .route("/reset/:user/password")
  .get(authController.getResetPassPage)
  .post(authController.postResetPassPage);

authRouter.delete("/:user_id/delete", authController.deleleUser);
export default authRouter;
