import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.routes.ts";
import dashBoardRouter from "./routes/dashBoard.routes.ts";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/user.routes.ts";
import { protect } from "./middleware/auth.middleware.ts";
import session from "express-session";
import dotenv from "dotenv";
import {twittsRouter} from "./routes/twittes.routes.ts";
import methodOverride from "method-override";
import ExpressError from "./utils/ExpressError.ts";
import { ServicesRoute } from "./routes/captcha.routes.ts";
import userModel from "./model/user.model.ts";
import type { RowDataPacket } from "mysql2";
import statusMonitor from "express-status-monitor";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(statusMonitor());
dotenv.config();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use("/uploads", express.static(path.join("uploads")));
app.use("views", express.static("views"));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/images", express.static(path.join(__dirname, "../images")));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(path.join(__dirname, "../uploads/feed-Uploads"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.app.locals.user = req.cookies.username ; // Make username available in all views
  next();
});

app.get("/", protect,(req : Request, res : Response) => {
  res.redirect("/home");
});

app.use("/auth", authRouter);
app.use("/services", ServicesRoute);

app.use("/", protect, dashBoardRouter);
app.use("/user", protect, usersRouter);
app.use("/twitts", protect, twittsRouter);


app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use(async (error:any,req:Request,res:Response,next:NextFunction)=>{
  const {statusCode = 500, message = 'something went wrong'} = error;
  const username: string = req.cookies.username as string;
  const [result]: RowDataPacket[] = (await userModel.getUserByUsername(
    username,
  )) as RowDataPacket[];
  res.status(statusCode).render('error.ejs',{statusCode,message,user:result});
})

export default {
  app,
};
