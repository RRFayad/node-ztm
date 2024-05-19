const fs = require("fs");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const Strategy = require("passport-google-oauth20").Strategy;

const PORT = 3000;
require("dotenv").config();

const verifyCallback = (accessToken, refreshToken, profile, done) => {
  console.log({ accessToken, refreshToken, profile });
  done(null, profile);
};

// Passport Configuration MW
passport.use(
  new Strategy(
    {
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URI,
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    },
    verifyCallback
  )
);

const app = express();

app.use(helmet()); // The very 1st MW, to ensure all reqs passes here
app.use(passport.initialize());

// Notice that this MW is not running here, it was just created, to be implemented whenever it is wanted
const checkLoggedIn = (req, res, next) => {
  const isLoggedIn = true; // TO IMPLEMENT LOGIC HERE
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must log in!",
    });
  }
  next();
};

app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false, // We will keep it as false just for now
  }),
  (req, res, next) => {
    console.log("Google called us back!! Yaay");
  }
); // The specified redirect in our google configuration

app.get("/auth/logout", (req, res, next) => {});

app.get("/secret", checkLoggedIn, (req, res, next) => {
  return res.send("your secret value is 42");
});

app.get("/failure", (req, res, next) => {
  return res.send("Failed to Log in");
});

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

https
  .createServer(
    {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem"),
    },
    app
  )
  .listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
