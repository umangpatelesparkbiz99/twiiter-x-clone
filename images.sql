CREATE DATABASE IF NOT EXISTS Twitter_clone;
USE Twitter_clone;

-- 1. Users Table (Must be first)
CREATE TABLE `x_users`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uni_id` VARCHAR(255) NOT NULL UNIQUE,
    `name` VARCHAR(255) ,
    `lastname` VARCHAR(255) ,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `bio` TEXT,
    `phone` VARCHAR(255) ,
    `cover_image` VARCHAR(255),
    `profile_image` VARCHAR(255),
    `dob` DATE ,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


-- 2. Followers Table (Mapping user to user)
CREATE TABLE `x_follower`(
    `user_id` VARCHAR(255) NOT NULL,
    `follower_id`  VARCHAR(255) NOT NULL,
    PRIMARY KEY (`user_id`, `follower_id`),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_id`) REFERENCES `x_users`(`uni_id`) ON DELETE CASCADE,
    FOREIGN KEY(`follower_id`) REFERENCES `x_users`(`uni_id`) ON DELETE CASCADE
);

-- 3. Tweets Table
CREATE TABLE `x_twittes`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,	
    `uni_id` varchar(255) NOT NULL UNIQUE,
    `user_id` varchar(255) NOT NULL ,
    `content` VARCHAR(280) NOT NULL, -- Twitter limit is 280
    `content_image` VARCHAR(255),	
    `parent_id` varchar(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_id`) REFERENCES `x_users`(`uni_id`) ON DELETE CASCADE,
    foreign key (`parent_id`) references `x_twittes`(`uni_id`) on delete cascade
    
);

-- 5. Comments Table
CREATE TABLE `x_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uni_id` VARCHAR(255) NOT NULL UNIQUE,
    `tweet_id` VARCHAR(255) ,
    `user_id` VARCHAR(255) NOT NULL,
    `comment_id` varchar(255) ,
    `content` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tweet_id`)
        REFERENCES `x_twittes` (`uni_id`)
        ON DELETE CASCADE,
    FOREIGN KEY (`user_id`)
        REFERENCES `x_users` (`uni_id`)
        ON DELETE CASCADE,
    foreign key (`comment_id`)
        references `x_comments`(`uni_id`)
        ON DELETE CASCADE
);

-- 6. Likes Table (Separated for clarity)
CREATE TABLE `x_likes`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uni_id` VARCHAR(255) NOT NULL UNIQUE,
    `user_id` VARCHAR(255) NOT NULL NOT NULL,
    `tweet_id` VARCHAR(255) ,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_id`) REFERENCES `x_users`(`uni_id`) ON DELETE CASCADE,
    FOREIGN KEY(`tweet_id`) REFERENCES `x_twittes`(`uni_id`) ON DELETE CASCADE
);

CREATE TABLE `x_likes_comments`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uni_id` VARCHAR(255) NOT NULL UNIQUE,
    `user_id` VARCHAR(255) NOT NULL NOT NULL,
    `comment_id` VARCHAR(255) ,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(`user_id`) REFERENCES `x_users`(`uni_id`) ON DELETE CASCADE,
    FOREIGN KEY(`comment_id`) REFERENCES `x_comments`(`uni_id`) ON DELETE CASCADE
);

