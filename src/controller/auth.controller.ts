import { type Request, type Response } from "express";
import userModel from "../model/user.model.ts";
import { v4 as uuidv4 } from "uuid";
import { signToken } from "../utils/jwt.ts";
import { comparePasword, hashPassword } from "../service/hash.service.ts";
import { generateNewCaptcha } from "../service/captcha.service.ts";
import type { RowDataPacket } from "mysql2";

interface IUser extends Document {
  uni_id: string;
  username: string;
  email: string;
  password: string;
}

const authController = {
  deleleUser: async (req: Request, res: Response) => {
    try {
      const uni_id = req.params.user_id as string;
      const result = await userModel.deleteUser(uni_id);
        // console.log("inside deleteUser controller");
      if (result) {
        res.status(200).json({ message: `delete successful` });
        return;
      }
      res.status(400).json({ error: `something went wrong` });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  
  getResetPassPage: async (req: Request, res: Response) => {
    const user: string = req.params.user as string;

    const captchaPacket = generateNewCaptcha();

    res.clearCookie("otp").render("auth/rePassword", { user, captchaPacket });
    return;
  },
  postResetPassPage: async (req: Request, res: Response) => {
    const user: string = req.params.user as string;

    const password = req.body.newPassword;
    //password is not chnging I have to fix this
    const encPassword = await hashPassword(password);
    const [oldpassword] = (await userModel.getOldPassByEmail(
      user,
    )) as RowDataPacket[];

    const isSame = await comparePasword(password, oldpassword?.password);
    if (isSame) {
      res.status(422).json({ error: "old and new password can't be same" });
      return;
    }

    const changeResult = await userModel.cngPassByEmail(encPassword, user);

    if (changeResult) {
      res.status(200).json({ message: "password updated successfully.." });
      return;
    }
    res.status(304).json({ error: "password was not updated" });

    return;
  },
  getOtp: async (req: Request, res: Response) => {
    const user: string = req.params.user as string;

    const randomOtp = Math.floor(100000 + Math.random() * 900000);
    console.log(`Subject: ${randomOtp} is your verification code
      To:${user}
      From:x.helpdesk@gmail.com
Body:
Hello ${user},
We received a request to reset the password for your account. Please use the following one-time password (OTP) to proceed:
${randomOtp}
This code is valid for the next 2 minutes.
If you didn't request this change, you can safely ignore this email. No changes will be made to your account.
Thanks,
The X Team`);

    res.render("auth/otp", { randomOtp, user });
    return;
  },

  verifyUser: async (req: Request, res: Response) => {
    const user: string = req.params.user as string;

    const [result]: RowDataPacket[] = (await userModel.getUserByEmail(
      user,
    )) as RowDataPacket[];

    if (result) {
      res
        .status(200)
        .json({ message: "user is valid", username: result?.username });
      return;
    }
    res.status(404).json({ error: "user is not exits" });
    return;
  },

  getForgetPaga: (req: Request, res: Response) => {
    res.render("auth/forgetPass");
  },

  getRegisterPagePrimary: (req: Request, res: Response) => {
    const uni_id = uuidv4(); // 36 Length uuid generated
    res.render("auth/registerPagePrimary", { uni_id, error: null });
  },

  // Register User into database
  postRegisterPagePrimary: async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const email: string = req.body.email;
    const password: string = req.body.password;
    const uni_id: string = req.body.uni_id;

    // First check for Email and Username is not dublicate
    const existingUserByEmail = (await userModel.getUserByEmail(
      email,
    )) as RowDataPacket;
    const existingUserByUsername = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket;

    if (existingUserByEmail.length > 0) {
      res.status(400).render("auth/registerPagePrimary", {
        uni_id,
        error: "Email or username already exists",
      });
      return;
    }

    if (existingUserByUsername.length > 0) {
      res.status(400).render("auth/registerPagePrimary", {
        uni_id,
        error: "Email or username already exists",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const result = (await userModel.createUser({
      uni_id,
      username,
      email,
      password: hashedPassword,
    } as IUser)) as RowDataPacket;

    if (result.affectedRows) {
      res.status(201).json({ message: "created" });
      return;
    }
    res.status(422).json({ message: "Unprocess" });
    return;
  },

  // Render the second registration page with the unique ID
  getRegisterPageSecondary: (req: Request, res: Response) => {
    res.render("auth/registerPageSecondary", { uni_id: req.params.id });
  },

  postRegisterPageSecondary: async (req: Request, res: Response) => {
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const phone: string = req.body.phone;
    const uni_id: string = req.params.id as string;

    const result: any = await userModel.createUserInfo({
      uni_id,
      firstName,
      lastName,
      phone,
      dateOfBirth: new Date(),
    } as any);

    if (result.affectedRows) {
      res.status(201).json({ message: "User info created" });
      return;
    }
    res.status(422).json({ message: "User info not created" });
    return;
  },

  // Render the Login page
  getLoginPage: (req: Request, res: Response) => {
    const captchaPacket = generateNewCaptcha();
    res.render("auth/loginPage", { captchaPacket });
  },

  // Handle Login logic
  postLoginPage: async (req: Request, res: Response) => {
    const emailOrUsername: string = req.body.emailOrUsername;
    const password: string = req.body.password;
    const rememberMe: boolean = req.body.rememberMe;

    const existingUserByEmail: any =
      await userModel.getUserByEmail(emailOrUsername);
    const existingUserByUsername: any =
      await userModel.getUserByUsername(emailOrUsername);

    if (
      existingUserByEmail.length === 0 &&
      existingUserByUsername.length === 0
    ) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const user = existingUserByEmail[0] || existingUserByUsername[0];
    const isMatch = await comparePasword(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken({ uni_id: user.uni_id }, rememberMe ? "7d" : "1h");

    res.locals.user = user.username; // Store username in res.locals for later use

    res
      .cookie("token", token, { httpOnly: true })
      .cookie("username", user.username, { httpOnly: true })
      .status(200)
      .json({ message: "Login successful" });
    return;
  },

  logout: (req: Request, res: Response) => {
    res.clearCookie("token").clearCookie("username").redirect("/auth/login");
  },
};

export { authController };
