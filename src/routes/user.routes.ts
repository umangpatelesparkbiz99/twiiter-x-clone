import { Router, type Request } from "express";
import { userController } from "../controller/user.controller.ts";

import multer, { type FileFilterCallback } from "multer";
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ): void => {
    cb(null, "./uploads/user-Uploads");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ): void => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Add extension back to filename
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error("Only images are allowed"));
  }
  cb(null, true);
};
const uploads : multer.Multer = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 6, // 6MB
    files: 2,
  },
});

const usersRouter = Router();
usersRouter.get("/following",userController.getfollowing);
usersRouter.get("/follower", userController.getfollower);
usersRouter.get("/profile/", userController.getUserProfile);
usersRouter
  .route("/profile/edit")
  .get(userController.getUserEditPage)
  .patch(
    uploads.fields([
      {
        name: "cover_image",
        maxCount: 1,
      },
      {
        name: "profile_image",
        maxCount: 1,
      },
    ]),
    userController.patchUserEditPage,
  );

usersRouter
  .route("/profile/edit/password")
  .get(userController.getPasswordCngPage)
  .patch(userController.CngOldPasswd);


usersRouter.get("/profile/:username", userController.getSelectedUser);
usersRouter.post("/follow", userController.followUser);

usersRouter.delete("/:user_id/delete",userController.deleleUser)
export default usersRouter;
