const res = require("express/lib/response");
const { sign, verify } = require("jsonwebtoken");
require("dotenv").config();

function generateRegisterToken(registerInfo, confirmationLink) {
  const registerToken = sign(
    { registerInfo, confirmationLink },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );
  return registerToken;
}

//returns an access token
function generateAccessToken(user) {
  const accessToken = sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
  return accessToken;
}

//returns a new refresh token
function generateRefreshToken(user) {
  const refreshToken = sign({ user }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return refreshToken;
}

//validates access token against .env parameter
const validateToken = (req, res, next) => {
  const accessToken = req.cookies ? req.cookies["access-token"] : null;
  const refreshToken = req.cookies ? req.cookies["refresh-token"] : null;

  if (!accessToken && !refreshToken) {
    res.authenticated = false;
    return next();
  }

  if (accessToken) {
    try {
      const valid_access_token = verify(accessToken, process.env.JWT_SECRET);
      if (valid_access_token) {
        res.authenticated = true;
        return next();
      }
    } catch (error) {
      console.error("Access Token Error:", error);
    }
  }

  if (refreshToken) {
    try {
      const valid_refresh_token = verify(
        refreshToken,
        process.env.REFRESH_SECRET,
      );
      if (valid_refresh_token) {
        res.authenticated = true;
        let access_expiry = new Date(new Date().getTime() + 5 * 60 * 1000);
        const accessTokenNew = generateAccessToken(valid_refresh_token.user);
        res.cookie("access-token", accessTokenNew, {
          expires: access_expiry,
          httpOnly: true,
        });
        return next();
      }
    } catch (error) {
      console.error("Refresh Token Error:", error);
    }
  }

  // If neither token is valid
  res.authenticated = false;
  return next();
};

//validates refresh token against .env parameter
const validateRefreshToken = (token) => {
  const valid = verify(token, process.env.REFRESH_SECRET);
  return valid;
};

function generateResetToken(userId, reset_link) {
  const resetToken = sign({ userId, reset_link }, process.env.RESET_TOKEN, {
    expiresIn: "5m",
  });
  return resetToken;
}

function validateUser(req, res, next) {
  const accessToken = req.cookies["access-token"];
  if (req.body.action == "post") {
    try {
      if (verify(accessToken, process.env.token)) {
        return (res.render("post-submit.html"), res.end());
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return next();
}

module.exports = {
  generateAccessToken,
  validateToken,
  validateRefreshToken,
  generateRefreshToken,
  generateResetToken,
  validateUser,
  generateRegisterToken,
};
