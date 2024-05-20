const fs = require("fs");
const path = require("path");
const https = require("https");
const helmet = require("helmet");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
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

// Save session to the cookie
passport.serializeUser((user, done) => {
  done(null, user); // callbabk to run when there's no error ()
});

// Read the session from the cookie
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const app = express();

app.use(helmet()); // The very 1st MW, to ensure all reqs passes here
app.use(
  session({
    name: "MY-COOKIE",
    secret: [process.env.SESSION_SECRET_2, process.env.SESSION_SECRET_1], // Usually, we can use array, to rotate secret keys and not unable the current secret key
    resave: false, // avoid saving session that hasn't been modified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // time of persistance of the cookie
      secure: true, // It makes our cookie works only in https
      httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript
    },
  })
);
app.use(passport.initialize());
app.use(passport.session()); // Configs the sessions: Authentications the session, config the serializeUser and deserializeUser logic etc

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
    // session: false, // When implementing it was false => now, we set it to true, to work with cookies (which is the default)
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
