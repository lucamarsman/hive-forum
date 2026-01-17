// seed.js
// Usage: node seed.js
// Requires env vars: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME (hive_forum), DB_PORT (optional)

const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const {
  DB_HOST = "localhost",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "hive_forum",
  DB_PORT = "3306",
} = process.env;

async function seed() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    multipleStatements: false,
  });

  console.log("Connected to DB:", DB_NAME);

  // ---- Helpers
  const hash = (pw) => bcrypt.hash(pw, 10);

  // ---- Wipe existing data (safe order for FK constraints)
  // comments -> likes/saves -> posts -> memberships -> communities -> users -> registry/profilepictures
  await conn.execute("SET FOREIGN_KEY_CHECKS=0");
  for (const t of [
    "comments",
    "likes",
    "saves",
    "posts",
    "communitymemberships",
    "communities",
    "profilepictures",
    "registry",
    "users",
  ]) {
    try {
      await conn.execute(`TRUNCATE TABLE \`${t}\``);
      console.log("Truncated", t);
    } catch (e) {
      // If some tables aren't present in your DB yet, don't hard-crash the seed.
      console.warn(`Skip truncate ${t}:`, e.message);
    }
  }
  await conn.execute("SET FOREIGN_KEY_CHECKS=1");

  // ---- Create Users
  const users = [
    {
      username: "luca_dev",
      email: "luca_dev@test.local",
      password: "Password123!",
    },
    {
      username: "sarah_dev",
      email: "sarah_dev@test.local",
      password: "Password123!",
    },
    {
      username: "mike_dev",
      email: "mike_dev@test.local",
      password: "Password123!",
    },
  ];

  const userIds = [];
  for (const u of users) {
    const pwHash = await hash(u.password);
    const [res] = await conn.execute(
      `INSERT INTO users (username, password, email, bio)
       VALUES (?, ?, ?, ?)`,
      [
        u.username,
        pwHash,
        u.email,
        `Hi, I'm ${u.username}. This is seed data.`,
      ],
    );
    userIds.push(res.insertId);
  }
  console.log("Inserted users:", userIds);

  // ---- Create Communities
  const communities = [
    {
      name: "Tech & Homelab",
      description:
        "Servers, VLANs, Proxmox, OPNsense, and all that good stuff.",
    },
    {
      name: "Muay Thai Training",
      description: "Drills, sparring, mindset, and technique talk.",
    },
    {
      name: "Gaming & Builds",
      description: "Game servers, modpacks, and PC building.",
    },
  ];

  const communityIds = [];
  for (let i = 0; i < communities.length; i++) {
    const createdBy = userIds[i % userIds.length];
    const c = communities[i];
    const [res] = await conn.execute(
      `INSERT INTO communities (name, description, created_by, logo_path)
       VALUES (?, ?, ?, ?)`,
      [
        c.name,
        c.description,
        createdBy,
        "/public/assets/images/defaultCommunityLogo.svg",
      ],
    );
    communityIds.push(res.insertId);
  }
  console.log("Inserted communities:", communityIds);

  // ---- Community Memberships
  // Make creator a moderator; add others as members
  for (let i = 0; i < communityIds.length; i++) {
    const communityId = communityIds[i];
    const creatorId = userIds[i % userIds.length];

    // creator as moderator
    await conn.execute(
      `INSERT INTO communitymemberships (user_id, community_id, role)
       VALUES (?, ?, 'moderator')`,
      [creatorId, communityId],
    );

    // other users as members
    for (const uid of userIds) {
      if (uid === creatorId) continue;
      await conn.execute(
        `INSERT INTO communitymemberships (user_id, community_id, role)
         VALUES (?, ?, 'member')`,
        [uid, communityId],
      );
    }
  }
  console.log("Inserted community memberships");

  // ---- Posts
  const postsToCreate = [
    {
      communityId: communityIds[0],
      userId: userIds[0],
      title: "Rate my VLAN plan for a homelab",
      content:
        "I’m thinking Management/LAN/Servers/DMZ separation. Any gotchas with inter-VLAN rules?",
      tags: ["Networking", "Homelab", "VLANs"],
    },
    {
      communityId: communityIds[0],
      userId: userIds[1],
      title: "Best practices for running MySQL in Docker",
      content:
        "Named volumes vs bind mounts? Also how do you handle migrations/seeding cleanly?",
      tags: ["Docker", "MySQL"],
    },
    {
      communityId: communityIds[1],
      userId: userIds[0],
      title: "How to stop freezing when kicks come",
      content:
        "I know what to do, but my body doesn’t react in time. What drills helped you?",
      tags: ["MuayThai", "Defense"],
    },
    {
      communityId: communityIds[2],
      userId: userIds[2],
      title: "Minecraft server RAM: how much is too much?",
      content:
        "I gave my server 16–32GB. It runs better but I’ve heard too much can hurt GC.",
      tags: ["Minecraft", "Servers"],
    },
  ];

  const postIds = [];
  for (const p of postsToCreate) {
    const [res] = await conn.execute(
      `INSERT INTO posts (user_id, community_id, title, content, tags, media_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        p.userId,
        p.communityId,
        p.title,
        p.content,
        JSON.stringify(p.tags),
        null,
      ],
    );
    postIds.push(res.insertId);
  }
  console.log("Inserted posts:", postIds);

  // ---- Comments + Replies
  // comments.post_id, comments.user_id, comments.content, comments.parent_id
  // parent_id isn't FK'd in your schema, but we'll use it logically for replies.
  const commentIds = [];

  // Post 1 thread
  {
    const postId = postIds[0];
    const [c1] = await conn.execute(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES (?, ?, ?, NULL)`,
      [
        postId,
        userIds[1],
        "Looks solid. Be careful with management access rules and DNS/AD ports if you use them.",
      ],
    );
    const parentId = c1.insertId;
    commentIds.push(parentId);

    const [r1] = await conn.execute(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES (?, ?, ?, ?)`,
      [
        postId,
        userIds[0],
        "Good call—I'm planning a dedicated management VLAN with tight allowlists.",
        parentId,
      ],
    );
    commentIds.push(r1.insertId);

    const [r2] = await conn.execute(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES (?, ?, ?, ?)`,
      [
        postId,
        userIds[2],
        "Also consider a 'deny all inter-VLAN' default and add only what you need.",
        parentId,
      ],
    );
    commentIds.push(r2.insertId);
  }

  // Post 3 thread (Muay Thai)
  {
    const postId = postIds[2];
    const [c1] = await conn.execute(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES (?, ?, ?, NULL)`,
      [
        postId,
        userIds[2],
        "Slow it down. Do defense-only rounds and call the kick out loud as you check.",
      ],
    );
    const parentId = c1.insertId;
    commentIds.push(parentId);

    const [r1] = await conn.execute(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES (?, ?, ?, ?)`,
      [
        postId,
        userIds[0],
        "Defense-only rounds sounds perfect. I’ll try that this week.",
        parentId,
      ],
    );
    commentIds.push(r1.insertId);
  }

  console.log("Inserted comments (including replies):", commentIds);

  // ---- Optional: add a couple likes/saves
  try {
    await conn.execute(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [
      userIds[1],
      postIds[0],
    ]);
    await conn.execute(`INSERT INTO saves (user_id, post_id) VALUES (?, ?)`, [
      userIds[2],
      postIds[0],
    ]);
    console.log("Inserted a few likes/saves");
  } catch (e) {
    console.warn("Skipping likes/saves:", e.message);
  }

  await conn.end();
  console.log("✅ Seed complete.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
