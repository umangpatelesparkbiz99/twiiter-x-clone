import { type Request, type Response } from "express";
import userModel from "../model/user.model.ts";
import { v4 as uuidv4 } from "uuid";
import type { RowDataPacket } from "mysql2";
import { twittesModel } from "../model/tweets.model.ts";


const twittesController = {
  getShare: async (req: Request, res: Response) => {
    const tweet_id: string = req.params.post_id as string;
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

    req.app.locals.user = userdata;

    const [getTweet] = (await twittesModel.getTwittsById(
      tweet_id,
      user,
    )) as RowDataPacket[];
    if (!getTweet) {
      const [getComment] = (await twittesModel.getCommentsById(
        tweet_id,
        user,
      )) as RowDataPacket[];
      const getAllComments = (await twittesModel.getAllCmtsComments(
        tweet_id,
      )) as RowDataPacket;
      res.render("dashboard/share", {
        user: userdata,
        feed: getComment,
        commentes: getAllComments,
        isCommentsHell: true,
      });
      return;
    } else {
      const getAllComments = (await twittesModel.getAllComments(
        tweet_id,
      )) as RowDataPacket;

      res.render("dashboard/share", {
        user: userdata,
        feed: getTweet,
        commentes: getAllComments,
        isCommentsHell: false,
      });
      return;
    }
  },
  deleteComments: async (req: Request, res: Response) => {
    try {
      const getCommentId = req.params.comment_id as string;
      const getDeleteComment = (await twittesModel.deleteComment(
        getCommentId,
      )) as RowDataPacket;

      if (getDeleteComment) {
        res.status(202).json({ message: `delete successful.` });
        return;
      } else {
        res.status(400).json({ error: `not get delete` });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  },
  deletePost: async (req: Request, res: Response) => {
    try {
      const getPostId = req.params.post_id as string;
      const getDeletePost = (await twittesModel.deletePost(
        getPostId,
      )) as RowDataPacket;

      if (getDeletePost) {
        res.status(202).json({ message: `delete successful.` });
        return;
      } else {
        res.status(400).json({ error: `not get delete` });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  },
  postRetweet: async (req: Request, res: Response) => {
    const content = req.body.content;
    const parent_post_id = req.params.post_id;
    const uni_id: string = uuidv4();
    const user_name = req.cookies.username;
    const [userInfo]: RowDataPacket[] = (await userModel.getUserByUsername(
      user_name,
    )) as RowDataPacket[];

    const user_id: string = userInfo?.uni_id;

    const result = await twittesModel.postTwitte(
      {
        uni_id,
        user_id,
        content,
        parent_post_id,
      } as any,
      true,
    );

    res.redirect(`/`);
  },
  getRetweetPage: async (req: Request, res: Response) => {
    const tweet_id: string = req.params.post_id as string;
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
    req.app.locals.user = userdata;

    const [getTweet] = (await twittesModel.getTwittsById(
      tweet_id,
      user,
    )) as RowDataPacket[];

    res.render("dashboard/retweet.ejs", {
      user: userdata,
      feed: getTweet,
    });
    return;
  },

  getComments: async (req: Request, res: Response) => {
    const tweet_id: string = req.params.post_id as string;
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
    req.app.locals.user = userdata;

    const [getTweet] = (await twittesModel.getTwittsById(
      tweet_id,
      user,
    )) as RowDataPacket[];
    if (!getTweet) {
      const [getComment] = (await twittesModel.getCommentsById(
        tweet_id,
        user,
      )) as RowDataPacket[];
      const getAllComments = (await twittesModel.getAllCmtsComments(
        tweet_id,
      )) as RowDataPacket;
      res.render("dashboard/comments", {
        user: userdata,
        feed: getComment,
        commentes: getAllComments,
        isCommentsHell: true,
      });
      return;
    } else {
      const getAllComments = (await twittesModel.getAllComments(
        tweet_id,
      )) as RowDataPacket;

      res.render("dashboard/comments", {
        user: userdata,
        feed: getTweet,
        commentes: getAllComments,
        isCommentsHell: false,
      });
      return;
    }
  },
  postComments: async (req: Request, res: Response) => {
    const uni_id: string = uuidv4();
    const tweet_id: string = req.params.post_id as string;
    const user = req.cookies.username; // Access the username from res.locals
    const comment = req.body.comments as string;
    if (!user) {
      console.log("No user found in res.locals"); // Debug log if no user is found
      return res.status(401).redirect("/auth/login");
    }

    const [userdata]: RowDataPacket[] = (await userModel.getUserByUsername(
      user,
    )) as RowDataPacket[];
    if (!userdata || userdata.length === 0) {
      console.log(`No user data found for username: ${user}`);
      return res.status(404).redirect("/auth/login");
    }
    req.app.locals.user = user;
    const current_user = userdata.uni_id;
    const [getTweet] = (await twittesModel.getTwittsById(
      tweet_id,
      user,
    )) as RowDataPacket[];
    const isCommentHell = getTweet ? false : true;
    if (!getTweet) {
      const postTweetComment = (await twittesModel.makeAComment(
        {
          uni_Id: uni_id,
          tweet_id: tweet_id,
          current_user: current_user,
          comment: comment,
        } as any,
        isCommentHell,
      )) as any;
      if (postTweetComment?.affectedRows > 0) {
        res.status(201).redirect(`/twitts/${tweet_id}/comments`);
        return;
      }
      res.status(304).redirect(`/twitts/${tweet_id}/comments`);
    } else {
      const postTweetComment = (await twittesModel.makeAComment(
        {
          uni_Id: uni_id,
          tweet_id: tweet_id,
          current_user: current_user,
          comment: comment,
        } as any,
        isCommentHell,
      )) as any;
      if (postTweetComment?.affectedRows > 0) {
        res.status(201).redirect(`/twitts/${tweet_id}/comments`);
        return;
      }
      res.status(304).redirect(`/twitts/${tweet_id}/comments`);
    }
  },
  newPost: async (req: Request, res: Response) => {
    const uni_id: string = uuidv4();
    const user_name = req.cookies.username;
    const [userInfo]: RowDataPacket[] = (await userModel.getUserByUsername(
      user_name,
    )) as RowDataPacket[];

    const user_id: string = userInfo?.uni_id;

    const content: string = req.body.content;
    const path: string = req.file?.path as string;

    const result = await twittesModel.postTwitte(
      {
        uni_id,
        user_id,
        content,
        path,
      } as any,
      false,
    );

    res.redirect("/home");
  },
  likePost: async (req: Request, res: Response) => {
    const tweet_id = req.body.tweet_id;
    const user_id = req.body.user_id;

    const checkIfLiked = await twittesModel.checkLike(tweet_id, user_id);

    if (checkIfLiked) {
      // unliked

      const doUnlike: RowDataPacket = (await twittesModel.doUnlikePost(
        checkIfLiked[0].uni_id,
        user_id,
        tweet_id,
      )) as RowDataPacket;

      if (doUnlike?.affectedRows) {
        const [gettotalLikes] = (await twittesModel.getPostLikeCtn(
          tweet_id,
        )) as RowDataPacket[];
        let totalLike: number = gettotalLikes?.TotalLikes as number;
        res.status(200).json({ message: "Unliked this post", totalLike });
        return;
      }
      res.status(422).json({ error: "Not process like" });
      return;
    }
    // liked
    const like_uni_id = uuidv4();
    const doLike: RowDataPacket = (await twittesModel.doLikePost(
      like_uni_id,
      user_id,
      tweet_id,
    )) as RowDataPacket;

    if (doLike?.insertId) {
      const [gettotalLikes] = (await twittesModel.getPostLikeCtn(
        tweet_id,
      )) as RowDataPacket[];
      const totalLike: number = gettotalLikes?.TotalLikes as number;
      res.status(200).json({ message: "liked this post", totalLike });
      return;
    }
    res.status(422).json({ error: "Not process like" });
    return;
  },
  likeComment: async (req: Request, res: Response) => {
    const comment_id = req.body.comment_id;
    const user_id = req.body.user_id;

    const checkIfLiked = await twittesModel.checkCommentLike(
      comment_id,
      user_id,
    );

    if (checkIfLiked) {
      // unliked

      const doUnlike: RowDataPacket = (await twittesModel.doUnlikeComment(
        checkIfLiked[0].uni_id,
        user_id,
        comment_id,
      )) as RowDataPacket;

      if (doUnlike?.affectedRows) {
        const [gettotalLikes] = (await twittesModel.getCommentLikeCtn(
          comment_id,
        )) as RowDataPacket[];
        let totalLike: number = gettotalLikes?.TotalLikes as number;
        res.status(200).json({ message: "Unliked this post", totalLike });
        return;
      }
      res.status(422).json({ error: "Not process like" });
      return;
    }
    // liked
    const like_uni_id = uuidv4();
    const doLike: RowDataPacket = (await twittesModel.doLikeComment(
      like_uni_id,
      user_id,
      comment_id,
    )) as RowDataPacket;

    if (doLike?.insertId > 0) {
      const [gettotalLikes] = (await twittesModel.getCommentLikeCtn(
        comment_id,
      )) as RowDataPacket[];
      const totalLike: number = gettotalLikes?.TotalLikes as number;
      res.status(200).json({ message: "liked this post", totalLike });
      return;
    }
    res.status(422).json({ error: "Not process like" });
    return;
  },
};

export { twittesController };
