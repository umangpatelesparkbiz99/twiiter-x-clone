import {Router } from "express";
import { dashboardController } from "../controller/dashboard.controller.ts";

const dashBoardRouter = Router();

dashBoardRouter.get("/home", dashboardController.getHome);

export default dashBoardRouter; 