const queryDb = require("../utils/queryDb.js"); // import queryDb
const jwt_decode = require("jwt-decode"); // import jwt_decode

class Post {
  // post model
  static async createPost(req, res) {
    // create post
    if (res.authenticated) {
      // if user is authenticated
      const post_payload = {
        // create post payload
        title: req.body.post_title, // get post title from request body
        body: req.body.post_body, // get post body from request body
        tags: req.body.tags[1], // get post tags from request body
      };

      let decodedToken = jwt_decode(req.cookies["refresh-token"]); // decode JWT token
      const uid = decodedToken.user.userid; // get user ID from decoded JWT token
      let result;

      if (req.params.communityName) {
        const communityResult = await queryDb(
          "SELECT id FROM communities WHERE name = ?",
          [req.params.communityName],
        );
        const communityId = communityResult[0].id;

        if (req.file) {
          result = await queryDb(
            "INSERT INTO posts (title, content, media_path, user_id, community_id, tags) VALUES (?,?,?,?,?,?)",
            [
              post_payload.title,
              post_payload.body,
              req.file.path,
              uid,
              communityId,
              post_payload.tags,
            ],
          ); // insert post into database with media
        } else {
          result = await queryDb(
            "INSERT INTO posts (title, content, user_id, community_id, tags) VALUES (?,?,?,?,?)",
            [
              post_payload.title,
              post_payload.body,
              uid,
              communityId,
              post_payload.tags,
            ],
          ); // insert post into database
        }
      } else {
        if (req.file) {
          result = await queryDb(
            "INSERT INTO posts (title, content, media_path, user_id, tags) VALUES (?,?,?,?,?)",
            [
              post_payload.title,
              post_payload.body,
              req.file.path,
              uid,
              post_payload.tags,
            ],
          ); // insert post into database with media
        } else {
          result = await queryDb(
            "INSERT INTO posts (title, content, user_id, tags) VALUES (?,?,?,?)",
            [post_payload.title, post_payload.body, uid, post_payload.tags],
          ); // insert post into database
        }
      }

      const postId = result.insertId; // get post ID of newly created post

      res.redirect(`/post/${postId}`); // redirect to newly created post page
    } else {
      // if user is not authenticated
      res.redirect("/login"); // redirect to login page
    }
  }

  static async fetchPost(req, res) {
    // fetch post
    if (res.authenticated) {
      // if user is authenticated
      if (req.query.community) {
        try {
          console.log(req.query.community);
          const communityResult = await queryDb(
            `SELECT id FROM communities WHERE name = ?`,
            [req.query.community],
          );
          const communityId = communityResult[0].id;

          const limit = 5; // number of posts per page
          const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
          const offset = (page - 1) * limit; // calculate offset
          let decodedToken = jwt_decode(req.cookies["refresh-token"]); // decode JWT token
          const userId = decodedToken.user.userid; // get user ID from decoded JWT token

          // Fetch posts from db via user ID, limit, and offset. This version includes the like and save status of each post for the authenticated user
          const posts = await queryDb(
            `
                    SELECT 
                        p.post_id,
                        p.title,
                        p.content,
                        p.media_path,
                        p.timestamp,
                        p.user_id,
                        p.community_id,
                        p.tags,
                        p.likeCount,
                        u.username,   
                        EXISTS(
                            SELECT 1 
                            FROM likes 
                            WHERE likes.post_id = p.post_id AND likes.user_id = ?
                        ) AS liked,
                        EXISTS(
                            SELECT 1 
                            FROM saves 
                            WHERE saves.post_id = p.post_id AND saves.user_id = ?
                        ) AS saved
                    FROM posts p
                    JOIN users u ON p.user_id = u.user_id  
                    WHERE p.community_id = ?
                    ORDER BY p.timestamp DESC
                    LIMIT ? OFFSET ?
                `,
            [userId, userId, communityId, limit, offset],
          );
          return res.json(posts); // return posts as JSON
        } catch (error) {
          console.log(error);
        }
      }

      try {
        // try to fetch posts
        const limit = 5; // number of posts per page
        const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
        const offset = (page - 1) * limit; // calculate offset
        let decodedToken = jwt_decode(req.cookies["refresh-token"]); // decode JWT token
        const userId = decodedToken.user.userid; // get user ID from decoded JWT token

        // Fetch posts from db via user ID, limit, and offset. This version includes the like and save status of each post for the authenticated user
        const posts = await queryDb(
          `
                SELECT 
                    p.post_id,
                    p.title,
                    p.content,
                    p.media_path,
                    p.timestamp,
                    p.user_id,
                    p.community_id,
                    p.tags,
                    p.likeCount,
                    u.username,   
                    EXISTS(
                        SELECT 1 
                        FROM likes 
                        WHERE likes.post_id = p.post_id AND likes.user_id = ?
                    ) AS liked,
                    EXISTS(
                        SELECT 1 
                        FROM saves 
                        WHERE saves.post_id = p.post_id AND saves.user_id = ?
                    ) AS saved
                FROM posts p
                JOIN users u ON p.user_id = u.user_id   
                ORDER BY p.timestamp DESC
                LIMIT ? OFFSET ?
            `,
          [userId, userId, limit, offset],
        );
        res.json(posts); // return posts as JSON
      } catch (error) {
        // catch error
        console.log(error); // log error
      }
    } else {
      // if user is not authenticated
      if (req.query.community) {
        try {
          console.log(req.query.community);
          const communityResult = await queryDb(
            `SELECT id FROM communities WHERE name = ?`,
            [req.query.community],
          );
          const communityId = communityResult[0].id;

          const limit = 5; // number of posts per page
          const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
          const offset = (page - 1) * limit; // calculate offset

          // Fetch posts from db via user ID, limit, and offset. This version includes the like and save status of each post for the authenticated user
          const posts = await queryDb(
            `
                    SELECT 
                        p.post_id,
                        p.title,
                        p.content,
                        p.media_path,
                        p.timestamp,
                        p.user_id,
                        p.community_id,
                        p.tags,
                        p.likeCount,
                        u.username 
                    FROM posts p
                    JOIN users u ON p.user_id = u.user_id  
                    WHERE p.community_id = ?
                    ORDER BY p.timestamp DESC
                    LIMIT ? OFFSET ?
                `,
            [communityId, limit, offset],
          );
          return res.json(posts); // return posts as JSON
        } catch (error) {
          console.log(error);
        }
      }

      const limit = 5; // number of posts per page
      const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
      const offset = (page - 1) * limit; // calculate offset

      const posts = await queryDb(
        `
                SELECT 
                    p.post_id,
                    p.title,
                    p.content,
                    p.media_path,
                    p.timestamp,
                    p.user_id,
                    p.community_id,
                    p.tags,
                    p.likeCount,
                    u.username
                FROM posts p
                JOIN users u ON p.user_id = u.user_id   
                ORDER BY p.timestamp DESC
                LIMIT ? OFFSET ?
            `,
        [limit, offset],
      );
      res.json(posts);
    }
  }

  static async fetchPostHistory(req, res) {
    // fetch user's post history
    try {
      // try to fetch post history
      const limit = 5; // number of posts per page
      const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
      const offset = (page - 1) * limit; // calculate offset
      const username = req.params.username; // get username from request parameters

      const userId = await queryDb(
        "SELECT user_id FROM users WHERE username = ?",
        [username],
      ); // fetch user ID from database using user's username

      // Fetch all posts posted by the user from db via user ID, limit, and offset
      const posts = await queryDb(
        `
            SELECT 
                p.post_id,
                p.title,
                p.content,
                p.timestamp,
                p.user_id,
                u.username
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.user_id = ?
            ORDER BY p.timestamp DESC
            LIMIT ? OFFSET ?
        `,
        [userId[0].user_id, limit, offset],
      );
      res.json(posts); // return posts as JSON
    } catch (error) {
      // catch error
      console.log(error); // log error
    }
  }

  static async searchPost(req, res) {
    try {
      const searchVal = req.query.query ? `%${req.query.query}%` : `%`; // Default to wildcard if no query
      let tag = req.query.tag; // Extract the tag parameter
      const limit = 5; // Number of posts per page
      const page = req.query.page ? parseInt(req.query.page) : 1; // Get page number or default to 1
      const offset = (page - 1) * limit; // Calculate offset

      if (tag.includes("&")) {
        tag = tag.replace("&", "&amp;");
      }

      console.log(tag);

      // If the user is authenticated
      if (res.authenticated) {
        const decodedToken = jwt_decode(req.cookies["refresh-token"]); // Decode JWT token
        const userId = decodedToken.user.userid; // Get user ID from the token

        // Check if community filter is present
        if (req.query.community) {
          const communityResult = await queryDb(
            `SELECT id FROM communities WHERE name = ?`,
            [req.query.community],
          );
          const communityId = communityResult[0]?.id;
          if (!communityId) {
            return res.status(404).json({ error: "Community not found" });
          }

          const posts = await queryDb(
            `SELECT 
                            posts.*,
                            u.username,
                            EXISTS (
                                SELECT 1 
                                FROM likes 
                                WHERE likes.post_id = posts.post_id AND likes.user_id = ?
                            ) AS liked,
                            EXISTS (
                                SELECT 1 
                                FROM saves 
                                WHERE saves.post_id = posts.post_id AND saves.user_id = ?
                            ) AS saved
                        FROM posts
                        JOIN users u ON posts.user_id = u.user_id
                        WHERE (content LIKE ? OR title LIKE ? OR u.username LIKE ?)
                        AND JSON_CONTAINS(tags, JSON_QUOTE(?), '$')
                        AND community_id = ?
                        ORDER BY post_id DESC
                        LIMIT ? OFFSET ?`,
            [
              userId,
              userId,
              searchVal,
              searchVal,
              searchVal,
              tag,
              communityId,
              limit,
              offset,
            ],
          );

          res.json(posts);
          return;
        }

        // If no community filter, query by tag and general search query
        const posts = await queryDb(
          `SELECT 
                        posts.*,
                        u.username,
                        EXISTS (
                            SELECT 1 
                            FROM likes 
                            WHERE likes.post_id = posts.post_id AND likes.user_id = ?
                        ) AS liked,
                        EXISTS (
                            SELECT 1 
                            FROM saves 
                            WHERE saves.post_id = posts.post_id AND saves.user_id = ?
                        ) AS saved
                    FROM posts
                    JOIN users u ON posts.user_id = u.user_id
                    WHERE (content LIKE ? OR title LIKE ? OR u.username LIKE ?)
                    AND JSON_CONTAINS(tags, JSON_QUOTE(?), '$')
                    ORDER BY post_id DESC
                    LIMIT ? OFFSET ?`,
          [userId, userId, searchVal, searchVal, searchVal, tag, limit, offset],
        );

        res.json(posts);
        return;
      }

      // If the user is not authenticated
      const posts = await queryDb(
        `SELECT 
                    posts.*,
                    u.username
                FROM posts
                JOIN users u ON posts.user_id = u.user_id
                WHERE (content LIKE ? OR title LIKE ? OR u.username LIKE ?)
                AND JSON_CONTAINS(tags, JSON_QUOTE(?), '$')
                ORDER BY post_id DESC
                LIMIT ? OFFSET ?`,
        [searchVal, searchVal, searchVal, tag, limit, offset],
      );

      res.json(posts);
    } catch (error) {
      console.error("Error in searchPost:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = Post; // export post model
