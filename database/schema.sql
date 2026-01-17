-- Hive Forum Database Schema

-- users Table
CREATE TABLE `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(500) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `reset_link` VARCHAR(255) DEFAULT NULL,
  `bio` VARCHAR(150) DEFAULT NULL,
  `reset_link_timestamp` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
);

-- communities Table
CREATE TABLE `communities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT NOT NULL,
  `logo_path` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Community Memberships Table
CREATE TABLE `communitymemberships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `community_id` INT NOT NULL,
  `role` ENUM('member', 'moderator') DEFAULT 'member',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE (`user_id`, `community_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE
);

-- posts Table
CREATE TABLE `posts` (
  `post_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `media_path` VARCHAR(255) DEFAULT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `likeCount` INT DEFAULT 0,
  `community_id` INT DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE
);

-- comments Table
CREATE TABLE `comments` (
  `comment_id` INT NOT NULL AUTO_INCREMENT,
  `post_id` INT DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `parent_id` INT DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- likes Table
CREATE TABLE `likes` (
  `like_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  PRIMARY KEY (`like_id`),
  UNIQUE (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`)
);

-- saves Table
CREATE TABLE `saves` (
  `save_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  PRIMARY KEY (`save_id`),
  UNIQUE (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`)
);

-- Profile Pictures Table
CREATE TABLE `profilepictures` (
  `picture_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `image_path` VARCHAR(255) DEFAULT NULL,
  `uploaded_on` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`picture_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);

-- registry Table
CREATE TABLE `registry` (
  `email` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `username` VARCHAR(255) DEFAULT NULL,
  `register_link` VARCHAR(255) DEFAULT NULL,
  `register_link_timestamp` VARCHAR(255) DEFAULT NULL
);
