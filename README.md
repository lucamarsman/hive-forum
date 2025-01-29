Hive Forum

Hive Forum is a full-stack community-driven discussion platform where users can create, join, and interact with various communities. It is designed to offer a smooth and interactive user experience, featuring authentication, post filtering, media uploads, and more.

🚀 Features

✅ Implemented Features

User Authentication

Secure login and registration system using JWT authentication with refresh tokens.

Google OAuth integration for quick sign-in.

Community System

Users can create and join communities ("hives").

Community pages display posts and statistics.

Post & Media Management

Users can create, edit, and delete posts.

Support for image and video uploads.

Post liking and saving functionality.

Comments & Replies

Nested comment system with a max depth of 5.

Like and delete comments.

Infinite Scroll & Pagination

Posts and comments load dynamically to improve performance.

Search & Filtering (Partial)

Users can search for posts by keywords.

Filtering by tags and categories (still in progress).

Rate Limiting & Security

API rate limiting to prevent spam.

CSRF protection & secure cookie handling.

🛠️ Architecture & Tech Stack

Backend

Node.js & Express - RESTful API.

MySQL - Relational database for structured data storage.

JWT Authentication - Secure token-based authentication.

Multer - For media uploads.

Rate Limiting - To prevent abuse.

Frontend

HTML, CSS, JavaScript (Vanilla) - No frontend framework yet.

AJAX Fetch API - Handles dynamic content loading.

Custom Styling & Responsive Design - (Some pages still need improvements).

⚠️ Work in Progress 🚧

Community Moderation - Ability to edit/delete communities.

Advanced Post Filtering - Sort by new, top, and hot posts.

User Profiles - Customizable profile pages with avatars and bios.

Improved Mobile Responsiveness - Some pages are not fully optimized yet.

Deployment - Currently only available locally; hosting is planned.

📜 Setup & Installation

Prerequisites

Node.js & npm

MySQL database

Steps to Run Locally

# Clone the repository
git clone https://github.com/lucamarsman/hive-forum.git
cd hive-forum

# Install dependencies
npm install

# Set up environment variables (.env file)
# Example:
# DATABASE_URL=mysql://user:password@localhost/hiveforum
# JWT_SECRET=your_secret_key

# Start the server
node server.js

📌 Future Plans

Full-featured admin panel.

Optimized backend queries for performance.

Improved UX with animations and better UI elements.

WebSockets for real-time interactions.

This project is still actively being developed, and feedback or contributions are welcome! 🎉





