CREATE TABLE `users` (
    `username` varchar(14) NOT NULL PRIMARY KEY,
    `name` varchar(150) NOT NULL,
    `password` varchar(128) NOT NULL,
    `email` varchar(50) NOT NULL,
    `joined` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `description` text,

    INDEX `user_index` (`username`)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `channels` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `title` varchar(128) NOT NULL,
    `username` varchar(14) NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `subscribers` bigint NOT NULL DEFAULT 0,
    `description` text,

    CONSTRAINT `FK_4d05b2b1f37b07db352912523dd`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    INDEX `channel_id_pk` (id)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `videos` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `title` varchar(128) NOT NULL,
    `description` text,
    `channel_id` varchar(36) NOT NULL,
    `username` varchar(14) NOT NULL,
    `uploaded_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `listing` smallint NOT NULL,
    `tags` json,
    `categories` json,
    `likes` int NOT NULL DEFAULT 0,
    `dislikes` int NOT NULL DEFAULT 0,
    `views` int NOT NULL DEFAULT 0,
    `uploading` tinyint NOT NULL DEFAULT 1,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    CONSTRAINT `FK_023a8e4f3f1a34ff3d8ca04a4cc`
        FOREIGN KEY (`channel_id`)
        REFERENCES `channels`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT `FK_13b4493aa29cdd03779f7c1c5a6`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    
    INDEX `video_pk` (`id`)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `comments` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `username` varchar(14) NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `content` text NOT NULL,
    `video_id` varchar(36) NOT NULL,
    `parent_id` varchar(36),
    `likes` int NOT NULL DEFAULT 0,
    `dislikes` int NOT NULL DEFAULT 0,

    CONSTRAINT `FK_5d9144e84650ce78f40737e284e`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT `FK_0528681f0d2c6e89116dd3eb3f4`
        FOREIGN KEY (`video_id`)
        REFERENCES `videos`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    
    CONSTRAINT `FK_d6f93329801a93536da4241e386`
        FOREIGN KEY (`parent_id`)
        REFERENCES `comments`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    INDEX `comment_video_id_pk` (`video_id`)
) ENGINE=InnoDB CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE TABLE `comment_likes` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `username` varchar(14) NOT NULL,
    `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `liked` tinyint NOT NULL DEFAULT 1,
    `comment_id` varchar(36) NOT NULL,

    CONSTRAINT `FK_37ac2185fa26913b1b9acbe6747`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT `FK_2073bf518ef7017ec19319a65e5`
        FOREIGN KEY (`comment_id`)
        REFERENCES `comments`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE `video_likes` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `username` varchar(14) NOT NULL,
    `timestamp`  timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `video_id` varchar(36) NOT NULL,
    `liked` tinyint NOT NULL DEFAULT 1,

    CONSTRAINT `FK_d9e0e3d41c92383afd3ca61440a`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT `FK_c506d1da4d29d1fe3d9c244f1ac`
        FOREIGN KEY (`video_id`)
        REFERENCES `videos`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE `subscriptions` (
    `id` varchar(36) NOT NULL PRIMARY KEY, 
    `username` varchar(14) NOT NULL,
    `timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
    `channel_id` varchar(36) NOT NULL,

    CONSTRAINT `FK_cb0d911d3eec036a09331a13b4b`
        FOREIGN KEY (`username`)
        REFERENCES `users`(`username`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT `FK_f94727d15ad613cd0e651ce299c`
        FOREIGN KEY (`channel_id`)
        REFERENCES `channels`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE trending (
    `id` bigint NOT NULL PRIMARY KEY,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `views` bigint NOT NULL,
    `video_id` varchar(36) NOT NULL,

    CONSTRAINT `FK_404b8052912046ec081c9e25ff6`
        FOREIGN KEY (`video_id`)
        REFERENCES `videos`(`id`)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
) ENGINE=InnoDB;
