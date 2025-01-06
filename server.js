require("dotenv").config({ path: 'process.env' })
const express = require('express')
const app = express()
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const { generateAccessToken, validateToken, generateRefreshToken, generateResetToken, validateUser} = require('./Auth')
const { getOAuthAccessToken} = require('./OAuth')
const crypto = require('crypto');
const { JsonWebTokenError } = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const multer = require('multer');
const path = require('path');

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.json()) // for parsing application/json
app.use(cookieParser()) // for parsing cookies

const userRoutes = require('./routes/userRoutes'); // import user routes
app.use('/user', userRoutes); // use route

const viewRoutes = require('./routes/viewRoutes'); // import view routes
app.use('/', viewRoutes); // use route

const postRoutes = require('./routes/postRoutes'); // import post routes
app.use('/posts', postRoutes); // use route

const commentRoutes = require('./routes/commentRoutes'); // import comment routes
app.use('/comments', commentRoutes); // use route

const communityRoutes = require('./routes/communityRoutes'); // import comment routes
app.use('/communities', communityRoutes); // use route

app.engine('html', require('ejs').renderFile); 
app.set('view-engine', 'html') // set view engine to ejs
app.use('/public', express.static(path.join(__dirname, 'public')));


app.listen(3000) // listen on port 3000