const fs = require('fs');
const OAuth = require('oauth').OAuth;
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const config = require('./config');

const privateKeyData = fs.readFileSync(config["consumerPrivateKeyFile"], "utf8");
const oauthUrl = `${config.jiraUrl}/plugins/servlet/oauth/`;

// monkey-patch OAuth.get since it doesn't support content-type which is required by jira's API
OAuth.prototype.get = function (url, oauth_token, oauth_token_secret, callback, post_content_type) {
  return this._performSecureRequest(oauth_token, oauth_token_secret, "GET", url, null, "", post_content_type, callback);
};
// end monkey-patch

const consumer = new OAuth(
  `${oauthUrl}request-token`,
  `${oauthUrl}access-token`,
  config["consumerKey"],
  privateKeyData,
  "1.0",
  "http://8389e5b0.ngrok.io/sessions/callback",
  "RSA-SHA1"
);


const app = module.exports = express();
app.use(cookieParser());
app.use(session({
  secret: 'ssshhhh!',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));
app.use((req, res, next) => {
  res.session = req.session;
  next();
});

app.get('/', (request, response) => response.send.bind(response, 'Hello World'));
app.get('/sessions/connect', (request, response) => {
  consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
      if (error) {
        response.send('Error getting OAuth access token');
      }
      else {
        request.session.oauthRequestToken = oauthToken;
        request.session.oauthRequestTokenSecret = oauthTokenSecret;
        response.redirect(`${oauthUrl}authorize?oauth_token=${request.session.oauthRequestToken}`);
      }
    }
  );
});

app.get('/sessions/callback', (request, response) => {
  consumer.getOAuthAccessToken(
    request.session.oauthRequestToken,
    request.session.oauthRequestTokenSecret,
    request.query.oauth_verifier,
    (error, oauthAccessToken, oauthAccessTokenSecret) => {
      if (error) {
        response.send("error getting access token");
      }
      else {
        request.session.oauthAccessToken = oauthAccessToken;
        request.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        consumer.get(`${config.jiraUrl}/rest/auth/latest/session`,
          request.session.oauthAccessToken,
          request.session.oauthAccessTokenSecret,
          function (error, data) {
            console.log('response', data, error);
            data = JSON.parse(data);
            response.send(`Authorized username: ${data["name"]}`);
          },
          "application/json"
        );
      }
    }
  );
});


app.listen(parseInt(process.env.PORT || 8080));