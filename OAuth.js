const { OAuth2Client } = require("google-auth-library");

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
); // Intialize OAuth client with login credentials

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function getOAuthAccessToken() {
  const accessToken = await oAuth2Client.getAccessToken(); // Get new accesstoken from OAuth
  return accessToken.token;
}

module.exports = { getOAuthAccessToken };
