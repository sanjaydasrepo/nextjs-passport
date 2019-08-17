require("dotenv").config();
const express = require("express");
const http = require("http");
const next = require("next");
const session = require("express-session");

// importing dependencies

const passport = require("passport");
const uid = require('uid-safe');
const authRoutes = require("./auth-routes");
const thoughtsAPI = require("./thoughts-api");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const dev = process.env.NODE_ENV !== "production";

const app = next({
  dev,
  dir: "./src"
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // 2 - add session management to Express
  const sessionConfig = {
    secret: uid.sync(18),
    cookie: {
      maxAge: 86400 * 1000 // 24 hours in milliseconds
    },
    resave: false,
    saveUninitialized: true
  };
  server.use(session(sessionConfig));


  // Use the GoogleStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Google
  //   profile), and invoke a callback with a user object.
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
    function (accessToken, refreshToken, profile, done) {
     
        return done(null, profile);
    }
  ));

  // 4 - configuring Passport

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // 5 - adding Passport and authentication routes
  server.use(passport.initialize());
  server.use(passport.session());
  server.use(authRoutes);
  server.use(thoughtsAPI);

  // 6 - you are restricting access to some routes
  const restrictAccess = (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    next();
  };

  server.use("/profile", restrictAccess);
  server.use("/share-thought", restrictAccess);


  // handling everything else with Next.js
  server.get("*", handle);

  http.createServer(server).listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
  });
});

