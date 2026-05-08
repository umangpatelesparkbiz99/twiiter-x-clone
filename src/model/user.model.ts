import type { RowDataPacket } from "mysql2";
import pool from "../database/mysql/connection.ts";

interface IUser extends Document {
  uni_id: string;
  username: string;
  email: string;
  password: string;
}
interface IUserInfo extends Document {
  uni_id: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
}
interface INewUserInfo extends Document {
  username: string;
  firstname: string;
  lastname: string;
  bio: string;
  cover_image?: string;
  profile_image?: string;
}

const userModel = {
  deleteUser: async(uni_id : string)=>{
    try {
      const [result] = await pool.execute(`delete from x_users where uni_id = ?`, [uni_id]);
      // console.log("inside delterUser model ",result);
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getfullUserFollower: async (user: string) => {
    const [rows] = await pool.execute(
      `select uni_id, name, lastname, username, profile_image FROM x_users u
JOIN x_follower f ON u.uni_id = f.user_id
WHERE f.follower_id = ? `,
      [user],
    );
    return rows;
  },
  getfullUserFollowing: async (user: string) => {
    const [rows] = await pool.execute(
      `select uni_id, name, lastname, username, profile_image FROM x_users u
JOIN x_follower f ON u.uni_id = f.follower_id
WHERE f.user_id = ? `,
      [user],
    );
    return rows;
  },
  getAllSearchUser: async (user: string) => {
    const [rows] = await pool.execute(
      `select uni_id, name, lastname, email, password, username, bio, cover_image, profile_image FROM x_users WHERE username like '${user}%' or name like '${user}%' or lastname like '${user}' `,
    );
    return rows;
  },
  getOldPassByEmail: async (email: string) => {
    console.log("in getmethod " + email);
    const [rows] = await pool.execute(
      "select password from x_users WHERE email = ? ",
      [email],
    );
    return rows;
  },
  cngPassByEmail: async (password: string, email: string) => {
    const [rows] = await pool.execute(
      "update x_users set password = ? WHERE email = ?",
      [password, email],
    );
    return rows;
  },
  getUserByEmail: async (email: string) => {
    const [rows] = await pool.execute(
      "SELECT uni_id, name, lastname, email, password, username, bio, cover_image, profile_image FROM x_users WHERE email = ?",
      [email],
    );
    return rows;
  },
  getUserByUsername: async (username: string) => {
    const [rows] = await pool.execute(
      "SELECT uni_id, name, lastname, password, username, bio, cover_image, profile_image, dob, phone, email, created_at FROM x_users WHERE username = ?",
      [username],
    );
    return rows;
  },
  createUser: async (userData: IUser) => {
    const { uni_id, username, email, password } = userData;
    try {
      const [result] = await pool.execute(
        "INSERT INTO x_users (uni_id, username, email, password) VALUES (?, ?, ?, ?)",
        [uni_id, username, email, password],
      );
      return result;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  createUserInfo: async (userInfoData: IUserInfo) => {
    const { uni_id, firstName, lastName, phone, dateOfBirth } = userInfoData;
    try {
      const [result] = await pool.execute(
        "UPDATE x_users SET name = ?, lastname = ?, phone = ?, dob = ? WHERE uni_id = ?",
        [firstName, lastName, phone, dateOfBirth, uni_id],
      );
      return result;
    } catch (error) {
      console.error("Error creating user info:", error);
      throw error;
    }
  },
  getUserAndUpdate: async (newUserInfo: INewUserInfo) => {
    const {
      username,
      firstname,
      lastname,
      bio,
      cover_image = null,
      profile_image = null,
    } = newUserInfo;
    try {
      const [result] = await pool.execute(
        "UPDATE x_users SET name = ?, lastname = ?, bio = ?, cover_image = ?, profile_image = ? WHERE username = ?",
        [firstname, lastname, bio, cover_image, profile_image, username],
      );
      return result;
    } catch (error) {
      console.error("Error creating user info:", error);
      throw error;
    }
  },
  followUser: async (user1: string, user2: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "insert into x_follower(user_id,follower_id) values (?,?)",
        [user2, user1],
      )) as RowDataPacket[];
      return result?.affectedRows;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  inFollowList: async (user1: string, user2: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "select user_id, follower_id from x_follower where user_id= ? and follower_id = ? ",
        [user2, user1], // yash umang
      )) as RowDataPacket[];
      return result?.length > 0 ? true : false;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  unfollow: async (user1: string, user2: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "delete from Twitter_clone.x_follower where user_id = ? and follower_id = ?",
        [user2, user1],
      )) as RowDataPacket[];
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getUserFollowing: async (user: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "select count(*) as follower from x_follower where user_id = ?",
        [user], // yash
      )) as RowDataPacket[];
      return result?.length > 0 ? result : 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getUserFollower: async (user: string) => {
    try {
      const [result]: RowDataPacket[] = (await pool.execute(
        "select count(*) as follower from x_follower where follower_id = ?",
        [user],
      )) as RowDataPacket[];
      return result?.length > 0 ? result : 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default userModel;
