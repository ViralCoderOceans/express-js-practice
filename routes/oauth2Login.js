var express = require('express');
var passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
var fs = require('fs');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PLUGIN_NAME, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../constants/constant');

passport.use(new OAuth2Strategy({
  authorizationURL: 'https://github.com/login/oauth/authorize',
  tokenURL: 'https://github.com/login/oauth/access_token',
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
},
  function (accessToken, refreshToken, profile, done) {
    var db = JSON.parse(fs.readFileSync('passportDB.json'));
    var user = {
      id: profile.id,
      name: profile.displayName,
      username: profile.username,
      email: profile.emails[0].value,
      profileUrl: profile.profileUrl
    }
    db.CurrentGithubUsers = user;
    fs.writeFileSync('passportDB.json', JSON.stringify(db));
    if (!db.githubUsers.find((elm) => elm.id === profile.id)) {
      db.githubUsers.push(user);
      fs.writeFileSync('passportDB.json', JSON.stringify(db));
    }
    return done(null, profile);
  }
));

// passport.use(new OAuth2Strategy({
//   authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
//   tokenURL: 'https://accounts.google.com/o/oauth2/token',
//   clientID: GOOGLE_CLIENT_ID,
//   clientSecret: GOOGLE_CLIENT_SECRET,
//   callbackURL: '/oauth2/redirect/google'
// },
//   function (accessToken, refreshToken, profile, cb) {
//     var db = JSON.parse(fs.readFileSync('passportDB.json'));
//     var user = {
//       id: profile.id,
//       name: profile.displayName,
//       email: profile.emails[0].value
//     }
//     db.CurrentGoogleUsers = user;
//     fs.writeFileSync('passportDB.json', JSON.stringify(db));
//     if (!db.googleUsers.find((elm) => elm.id === profile.id)) {
//       db.googleUsers.push(user);
//       fs.writeFileSync('passportDB.json', JSON.stringify(db));
//     }
//     return cb(null, profile);
//   }
// ));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user);
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

var router = express.Router();

// router.get('/login', passport.authenticate('google'));

router.get('/login', passport.authenticate('github'));

router.get('/userData/:id', (req, res, next) => {
  // var user = JSON.parse(fs.readFileSync('passportDB.json')).googleUsers.find((elm) => elm.id === req.params.id);
  var user = JSON.parse(fs.readFileSync('passportDB.json')).githubUsers.find((elm) => elm.id === req.params.id);
  if (user) {
    res.status(200).send({
      success: true,
      data: {
        message: 'User found successfully.',
        user
      }
    });
  } else {
    res.status(400).send({
      success: false,
      data: {
        message: 'User not founded.'
      }
    });
  }
});

router.post('/logout', (req, res, next) => {
  var db = JSON.parse(fs.readFileSync('passportDB.json'))
  // db.CurrentGoogleUsers = {}
  db.CurrentGithubUsers = {}
  fs.writeFileSync('passportDB.json', JSON.stringify(db));
  req.logout((err) => {
    if (err) { return next(err); }
    res.status(200).send({
      success: true,
      data: {
        message: 'Logout successfully.'
      }
    });
  });
});

module.exports = router;