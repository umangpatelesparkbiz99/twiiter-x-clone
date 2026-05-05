import { type Request, type Response } from "express";
import userModel from "../model/user.model.ts";


import { twittesModel } from "../model/tweets.model.ts";
import type {  RowDataPacket } from "mysql2";
import { comparePasword, hashPassword } from "../service/hash.service.ts";

const userController = {
  deleleUser : async(req : Request,res : Response)=>{
    try {
      const uni_id = req.params.user_id as string;
      const result = await userModel.deleteUser(uni_id);
      if(result){
        res.status(200).json({message : `delete successful`})
        return;
      }
      res.status(400).json({error: `something went wrong`})
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getfollower: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: RowDataPacket[] = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket[];
    res.locals.following = false;
    res.locals.follower = true;
    const getFollowerList = await userModel.getfullUserFollowing(
      result?.uni_id,
    );

    
    res.render("user/follow_follower", { user: result , lists : getFollowerList   });
  },
  getfollowing: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: RowDataPacket[] = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket[];
    res.locals.following = true;
    res.locals.follower = false;
    
    const getFollowerList = await userModel.getfullUserFollower(result?.uni_id);
    res.render('user/follow_follower',{user:result, lists : getFollowerList});
  },
  CngOldPasswd: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: RowDataPacket[] = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket[];
    const oldpassword = req.body.oldpassword as string;
    const newPassword = req.body.newPassword as string;
    const reNewPassword = req.body.reNewPassword as string;

    const oldPassIsValid = await comparePasword(oldpassword, result?.password);
    if (
      !oldPassIsValid ||
      oldpassword === newPassword ||
      newPassword !== reNewPassword
    ) {
      res.status(400).redirect("/user/profile/edit/password");
      return;
    }

    const encryptPassword = await hashPassword(newPassword);
    const cngPassresult = await userModel.cngPassByEmail(
      encryptPassword,
      result?.email,
    );
    console.log(cngPassresult);
    res.redirect("/user/profile");
  },
  getPasswordCngPage: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: any = await userModel.getUserByUsername(username);
    res.render("user/resetPasswd", { user: result });
  },
  getUserProfile: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: any = await userModel.getUserByUsername(username);

    const [countFollower]: RowDataPacket[] = (await userModel.getUserFollowing(
      result.uni_id, // yash
    )) as RowDataPacket[];
    const totalFollower: number = countFollower?.follower as number;

    const [countFollowing]: RowDataPacket[] = (await userModel.getUserFollower(
      result.uni_id,
    )) as RowDataPacket[];
    const totalFollowing: number = countFollowing?.follower as number;

    const all_feed = await twittesModel.getOneUserAllFeed(
      result.uni_id,
      username,
    );

    res.render("user/profile", {
      user: result,
      all_feed,
      totalFollower,
      totalFollowing,
    });
  },

  getUserEditPage: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const [result]: any = await userModel.getUserByUsername(username);
    res.render("user/editPage", { user: result });
  },
  patchUserEditPage: async (req: Request, res: Response) => {
    const username = req.cookies?.username;
    const firstname = req.body.firstname.trim();
    const lastname = req.body.lastname.trim();
    const bio = req.body.bio.trim();
    let cover_image = null,
      profile_image = null;
    if ((req.files as any)["cover_image"]) {
      cover_image = (req.files as any)["cover_image"][0]?.path;
    }
    if ((req.files as any)["profile_image"]) {
      profile_image = (req.files as any)["profile_image"][0]?.path;
    }

    const result: RowDataPacket[] = (await userModel.getUserAndUpdate({
      username,
      firstname,
      lastname,
      bio,
      cover_image,
      profile_image,
    } as any)) as RowDataPacket[];
    res.redirect("/user/profile/");
  },

  getSelectedUser: async (req: Request, res: Response) => {
    const username: string = req.cookies.username as string;
    const reqUsername: string = req.params.username as string;
    if (username === reqUsername) {
      res.redirect("/user/profile/");
      return;
    }
    const [result]: any = await userModel.getUserByUsername(reqUsername);

    const [user1]: RowDataPacket[] = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket[];

    const all_feed = await twittesModel.getOneUserAllFeed(
      user1?.uni_id,
      reqUsername,
    );

    const uni_id1 = user1?.uni_id; // umang
    const uni_id2 = result?.uni_id; // yash
    const isfollower = await userModel.inFollowList(uni_id1, uni_id2); // umang yash

    const [countFollower]: RowDataPacket[] = (await userModel.getUserFollowing(
      uni_id2, // yash
    )) as RowDataPacket[];
    const totalFollower: number = countFollower?.follower as number;

    const [countFollowing]: RowDataPacket[] = (await userModel.getUserFollower(
      uni_id2,
    )) as RowDataPacket[];
    const totalFollowing: number = countFollowing?.follower as number;

    res.render("user/viewProfile", {
      reqUser: username,
      user: result,
      all_feed,
      isfollower,
      totalFollower,
      totalFollowing,
    });
  },
  followUser: async (req: Request, res: Response) => {
    const username = req.body.req_uni_id;
    const followingUser = req.body.uni_id;

    const [user1]: RowDataPacket[] = (await userModel.getUserByUsername(
      username,
    )) as RowDataPacket[];
    const [user2]: RowDataPacket[] = (await userModel.getUserByUsername(
      followingUser,
    )) as RowDataPacket[];
    const uni_id1 = user1?.uni_id;
    const uni_id2 = user2?.uni_id;

    const isFollowing = await userModel.inFollowList(uni_id1, uni_id2);
    if (isFollowing) {
      const unfollowPro = await userModel.unfollow(uni_id1, uni_id2);
      if (unfollowPro) {
        const [countFollower]: RowDataPacket[] =
          (await userModel.getUserFollowing(uni_id2)) as RowDataPacket[];
        const totalFollower: number = countFollower?.follower as number;
        res.status(200).json({
          message: `${user1} unfollow ${user2}`,
          totalFollower: totalFollower,
        });
        return;
      }
      res.status(401).json({ message: `something went wrong` });
      return;
    }

    const result = await userModel.followUser(uni_id1, uni_id2);

    if (result) {
      const [countFollower]: RowDataPacket[] =
        (await userModel.getUserFollowing(uni_id2)) as RowDataPacket[];
      const totalFollower: number = countFollower?.follower as number;
      res.status(200).json({
        message: `${user1} follow ${user2}`,
        totalFollower: totalFollower,
      });
      return;
    }

    res.status(401).json({ message: `something went wrong` });

    return;
  },
};

export { userController };
