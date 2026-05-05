import { type Request, type Response } from "express";
import userModel from "../model/user.model.ts";
import type { RowDataPacket } from "mysql2";
import { twittesModel } from "../model/tweets.model.ts";

const dashboardController = {
  getHome: async (req: Request, res: Response) => {
    const user = req.cookies.username; // Access the username from res.locals
    if (!user) {
      console.log("No user found in res.locals"); // Debug log if no user is found
      return res.status(401).redirect("/auth/login");
    }

    const [userdata]: RowDataPacket[] = (await userModel.getUserByUsername(
      user,
    )) as RowDataPacket[];
    if (!userdata || userdata.length === 0) {
      console.log(`No user data found for username: ${user}`); // Debug log if user data is not found
      return res.status(404).redirect("/auth/login");
    }
    req.app.locals.user = user;

    // Get all twittes while on this page
    let globalSerach ;
    const search = req.query.search as string;
    if (search) {
      // I have to implement serch function here
      const searchword = search.slice(1);
      const getUsers = await userModel.getAllSearchUser(searchword) as RowDataPacket[];
      globalSerach = getUsers;
    }
    if(globalSerach !== undefined){  
      res.app.locals.searchUser = globalSerach;
    }
    const all_feed = await twittesModel.getAllFeed(userdata.uni_id);
    res.render("dashboard/home", { user: userdata, all_feed });
  },
};

export { dashboardController };
