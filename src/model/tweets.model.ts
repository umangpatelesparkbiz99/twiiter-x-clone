import pool from "../database/mysql/connection.ts";
import type { RowDataPacket } from "mysql2";

interface Itwitte extends Document {
  uni_id: string;
  user_id: string;
  content: string;
  path?: string;
  parent_post_id?: string;
}
interface IComment extends Document {
  uni_Id: string;
  tweet_id: string;
  current_user: string;
  comment: string;
}

const twittesModel = {
  getCommentsById: async (uni_id: string, current_user: string) => {
    try {
      const [result] = await pool.execute(
        `SELECT 
    c.uni_id as comments_uni_id,
    c.tweet_id,
    c.content,
    c.created_at,
    c.updated_at,
    u.uni_id,
    u.name,
    u.lastname,
    u.username,
    u.profile_image
FROM
    x_comments c
        JOIN
    x_users u ON u.uni_id = c.user_id
WHERE
    c.uni_id = ? `,
        [uni_id],
      );

      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  deleteComment: async (post_id: string) => {
    try {
      const [result] = await pool.execute(
        `delete from x_comments where uni_id = ?`,
        [post_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deletePost: async (post_id: string) => {
    try {
      const [result] = await pool.execute(
        `delete from x_twittes where uni_id = ?`,
        [post_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getAllCmtsComments: async (post_id: string) => {
    try {
      const [result] = await pool.execute(
        `SELECT 
    u.uni_id AS user_uni_id, 
    c.uni_id AS comments_uni_id,
    u.name,
    u.lastname,
    u.username,
    u.profile_image,
    c.content, 
    c.updated_at,
    c.created_at
FROM x_comments c
JOIN x_users u ON c.user_id = u.uni_id
WHERE c.comment_id = ?
ORDER BY c.created_at DESC`,
        [post_id],
      );
      return result;
    } catch (error) {
      console.error("Error creating comments:", error);
      throw error;
    }
  },
  getAllComments: async (post_id: string) => {
    try {
      const [result] = await pool.execute(
        `SELECT 
    u.uni_id AS user_uni_id, 
    c.uni_id AS comments_uni_id,
    u.name,
    u.lastname,
    u.username,
    u.profile_image,
    c.content, 
    c.updated_at,
    c.created_at
FROM x_comments c
JOIN x_users u ON c.user_id = u.uni_id
WHERE c.tweet_id = ?
ORDER BY c.created_at DESC;
`,
        [post_id],
      );
      return result;
    } catch (error) {
      console.error("Error creating comments:", error);
      throw error;
    }
  },
  makeAComment: async (comments: IComment, isCommentHell: boolean) => {
    const { uni_Id, tweet_id, current_user, comment } = comments;
    try {
      if (isCommentHell) {
        const [result] = await pool.execute(
          `insert into x_comments(uni_id,comment_id,user_id,content) values (?,?,?,?)`,
          [uni_Id, tweet_id, current_user, comment],
        );
        return result;
      } else {
        const [result] = await pool.execute(
          `insert into x_comments(uni_id,tweet_id,user_id,content) values (?,?,?,?)`,
          [uni_Id, tweet_id, current_user, comment],
        );
        return result;
      }
    } catch (error) {
      console.error("Error creating comments:", error);
      throw error;
    }
  },
  getTwittsById: async (uni_id: string, current_user: string) => {
    try {
      const [result] = await pool.execute(
        `SELECT
            u.uni_id AS user_uni_id,
            t.uni_id AS tweet_uni_id,
            u.name,
            u.lastname,
            u.username,
            u.profile_image,
            t.content,
            t.content_image,
            t.created_at,
            t.updated_at,
            CASE WHEN t.parent_id IS NOT NULL THEN 1 ELSE 0 END AS is_retweet,
            parent_t.content AS retweet_content,
            parent_t.content_image AS retweet_content_image,
            COUNT(DISTINCT l.id) AS total_likes,
            COUNT(DISTINCT c.id) AS total_comments,
            COUNT(DISTINCT r.id) AS total_retweets, 
            MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS isLikedByUser
        FROM x_users u
        JOIN x_twittes t ON u.uni_id = t.user_id
        LEFT JOIN x_twittes parent_t ON t.parent_id = parent_t.uni_id 
        LEFT JOIN x_likes l ON t.uni_id = l.tweet_id
        LEFT JOIN x_comments c ON t.uni_id = c.tweet_id
        LEFT JOIN x_twittes r ON t.uni_id = r.parent_id
      where t.uni_id = ?
     GROUP BY 
            t.id, 
            u.id, 
            t.parent_id, 
            parent_t.content, 
            parent_t.content_image
        ORDER BY t.created_at DESC `,
        [current_user, uni_id],
      );

      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  postTwitte: async (twitteData: Itwitte, isRepost: boolean) => {
    const {
      uni_id,
      user_id,
      content,
      path = null,
      parent_post_id = null,
    } = twitteData;
    try {
      let result;
      if (isRepost) {
        [result] = await pool.execute(
          "INSERT INTO x_twittes(uni_id,user_id,content,parent_id) VALUES(?,?,?,?)",
          [uni_id, user_id, content, parent_post_id],
        );
      } else {
        [result] = await pool.execute(
          "INSERT INTO x_twittes(uni_id,user_id,content,content_image) VALUES(?,?,?,?)",
          [uni_id, user_id, content, path],
        );
      }
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  getAllFeed: async (current_user: string) => {
    try {
      // still we need to get(JOIN) like and comment for count and find user
      const [result] = await pool.execute(
        `
        SELECT
            u.uni_id AS user_uni_id,
            t.uni_id AS tweet_uni_id,
            u.name,
            u.lastname,
            u.username,
            u.profile_image,
            t.content,
            t.content_image,
            t.created_at,
            t.updated_at,
            CASE WHEN t.parent_id IS NOT NULL THEN 1 ELSE 0 END AS is_retweet,
            parent_t.content AS retweet_content,
            parent_t.content_image AS retweet_content_image,
            COUNT(DISTINCT l.id) AS total_likes,
            COUNT(DISTINCT c.id) AS total_comments,
            COUNT(DISTINCT r.id) AS total_retweets, 
            MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS isLikedByUser
        FROM x_users u
        JOIN x_twittes t ON u.uni_id = t.user_id
        LEFT JOIN x_twittes parent_t ON t.parent_id = parent_t.uni_id 
        LEFT JOIN x_likes l ON t.uni_id = l.tweet_id
        LEFT JOIN x_comments c ON t.uni_id = c.tweet_id
        LEFT JOIN x_twittes r ON t.uni_id = r.parent_id
        GROUP BY 
            t.id, 
            u.id, 
            t.parent_id, 
            parent_t.content, 
            parent_t.content_image
        ORDER BY t.created_at DESC
`,
        [current_user],
      );
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  getOneUserAllFeed: async (user_id: string, username: string) => {
    try {
      const [result] = await pool.execute(
        `SELECT
            u.uni_id AS user_uni_id,
            t.uni_id AS tweet_uni_id,
            u.name,
            u.lastname,
            u.username,
            u.profile_image,
            t.content,
            t.content_image,
            t.created_at,
            t.updated_at,
            CASE WHEN t.parent_id IS NOT NULL THEN 1 ELSE 0 END AS is_retweet,
            parent_t.content AS retweet_content,
            parent_t.content_image AS retweet_content_image,
            COUNT(DISTINCT l.id) AS total_likes,
            COUNT(DISTINCT c.id) AS total_comments,
            COUNT(DISTINCT r.id) AS total_retweets, 
            MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS isLikedByUser
        FROM x_users u
        JOIN x_twittes t ON u.uni_id = t.user_id
        LEFT JOIN x_twittes parent_t ON t.parent_id = parent_t.uni_id 
        LEFT JOIN x_likes l ON t.uni_id = l.tweet_id
        LEFT JOIN x_comments c ON t.uni_id = c.tweet_id
        LEFT JOIN x_twittes r ON t.uni_id = r.parent_id
      WHERE u.username = ? 
      GROUP BY 
            t.id, 
            u.id, 
            t.parent_id, 
            parent_t.content, 
            parent_t.content_image
        ORDER BY t.created_at DESC`,
        [user_id, username],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  checkLike: async (tweet_id: string, user_id: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        //I have to remove unuse variables
        "select uni_id, user_id, tweet_id from x_likes where user_id = ? and tweet_id = ? ",
        [user_id, tweet_id],
      )) as RowDataPacket[];
      return result?.length > 0 ? result : 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  doLikePost: async (uni_id: string, user_id: string, post_id: string) => {
    try {
      const [result] = await pool.execute(
        "insert into x_likes(uni_id, user_id, tweet_id) values (?,?,?)",
        [uni_id, user_id, post_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  doUnlikePost: async (uni_id: string, user_id: string, post_id: string) => {
    try {
      const [result] = await pool.execute(
        "delete from x_likes where uni_id = ? and user_id = ? and tweet_id = ? ",
        [uni_id, user_id, post_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getPostLikeCtn: async (post_id: string) => {
    try {
      const [result] = await pool.execute(
        "select count(*) as TotalLikes from x_likes where tweet_id = ? ",
        [post_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  checkCommentLike: async (comment_id: string, user_id: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "select uni_id, user_id, comment_id from x_likes_comments where user_id = ? and comment_id = ? ",
        [user_id, comment_id],
      )) as RowDataPacket[];
      return result?.length > 0 ? result : 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  doLikeComment: async (
    uni_id: string,
    user_id: string,
    comment_id: string,
  ) => {
    try {
      const [result] = await pool.execute(
        "insert into x_likes_comments(uni_id, user_id, comment_id) values (?,?,?)",
        [uni_id, user_id, comment_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  doUnlikeComment: async (
    uni_id: string,
    user_id: string,
    comment_id: string,
  ) => {
    try {
      const [result] = await pool.execute(
        "delete from x_likes_comments where uni_id = ? and user_id = ? and comment_id = ? ",
        [uni_id, user_id, comment_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getCommentLikeCtn: async (comment_id: string) => {
    try {
      const [result] = await pool.execute(
        "select count(*) as TotalLikes from x_likes_comments where comment_id = ? ",
        [comment_id],
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export { twittesModel };
