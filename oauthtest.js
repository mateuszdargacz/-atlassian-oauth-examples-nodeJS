const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const OAuth = require('oauth').OAuth;
fs = require('fs');

const app = module.exports = express();

app.use(cookieParser());
app.use(session({
  secret: 'ssshhhh!',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

const configFile = "./config.js";
const config = require(configFile);

const privateKeyData = fs.readFileSync(config["consumerPrivateKeyFile"], "utf8");
const consumer =
  new OAuth("https://attensi.atlassian.net/plugins/servlet/oauth/request-token",
    "https://attensi.atlassian.net/plugins/servlet/oauth/access-token",
    config["consumerKey"],
    privateKeyData,
    "1.0",
    "http://8389e5b0.ngrok.io/sessions/callback",
    "RSA-SHA1", () => {});


app.use(function (req, res, next) {
  res.session = req.session;
  next();
});

app.get('/', function (request, response) {
  response.send('Hello World');
});

app.get('/sessions/connect', function (request, response) {
  consumer.getOAuthRequestToken(
    function (error, oauthToken, oauthTokenSecret, results) {
      if (error) {
        response.send('Error getting OAuth access token');
      }
      else {
        console.log('got that shiet', error, oauthToken, oauthTokenSecret)
        request.session.oauthRequestToken = oauthToken;
        request.session.oauthRequestTokenSecret = oauthTokenSecret;
        response.session.oauthRequestToken = oauthToken;
        response.session.oauthRequestTokenSecret = oauthTokenSecret;
        response.redirect("https://attensi.atlassian.net/plugins/servlet/oauth/authorize?oauth_token=" + request.session.oauthRequestToken);
      }
    }
  )
});

app.get('/sessions/callback', function (request, response) {
  consumer.getOAuthAccessToken(
    request.session.oauthRequestToken,
    request.session.oauthRequestTokenSecret,
    request.query.oauth_verifier,
    function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
      if (error) {
        response.send("error getting access token");
      }
      else {
        request.session.oauthAccessToken = oauthAccessToken;
        request.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
        consumer.get("https://attensi.atlassian.net/rest/tempo-timesheets/3/worklogs/",
          request.session.oauthAccessToken,
          request.session.oauthAccessTokenSecret,
          function (error, data, resp) {
          console.log('error', data, error)
            data = JSON.parse(data);
            response.send("I am looking at: " + data["key"]);
          }
        );
      }
    }
  )
});


app.listen(parseInt(process.env.PORT || 8080));