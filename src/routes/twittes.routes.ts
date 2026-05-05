import {
  Router,
  type Request,
} from "express";
import { twittesController } from "../controller/twittes.controller.ts";
import multer, { type FileFilterCallback } from "multer";

const twittsRouter: Router = Router();

// Define Storage
const storage: multer.StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ): void => {
    cb(null, "./uploads/feed-Uploads");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ): void => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// Define File Filter
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

const uploads: multer.Multer = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 6, // 6MB
    files: 1,
  },
});

twittsRouter.post(
  "/create",
  uploads.single("feedPhoto"),
  twittesController.newPost,
);

twittsRouter
  .route("/:post_id/comments")
  .get(twittesController.getComments)
  .post(twittesController.postComments);

twittsRouter
  .route("/:post_id/Retweet")
  .get(twittesController.getRetweetPage)
  .post(twittesController.postRetweet);

twittsRouter.post("/like", twittesController.likePost);

twittsRouter.delete("/:post_id/delete",twittesController.deletePost);

twittsRouter.delete("/comments/:comment_id/delete",twittesController.deleteComments);

export { twittsRouter };
