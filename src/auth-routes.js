const express = require("express");
const passport = require("passport");

const router = express.Router();


router.get('/login',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/token',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
    //changes
});


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;