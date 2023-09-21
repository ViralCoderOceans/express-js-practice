var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
var fs = require('fs');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PLUGIN_NAME } = require('../constants/constant');

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  pluginName: PLUGIN_NAME,
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile', 'email']
}, function verify(_, profile, cb) {
  var db = JSON.parse(fs.readFileSync('passportDB.json'));
  var user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value
  }
  db.CurrentGoogleUsers = user;
  fs.writeFileSync('passportDB.json', JSON.stringify(db));
  if (!db.googleUsers.find((elm) => elm.id === profile.id)) {
    db.googleUsers.push(user);
    fs.writeFileSync('passportDB.json', JSON.stringify(db));
  }
  return cb(null, profile);
}));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

var router = express.Router();

router.get('/login', passport.authenticate('google'));

router.get('/userData/:id', (req, res, next) => {
  var user = JSON.parse(fs.readFileSync('passportDB.json')).googleUsers.find((elm) => elm.id === req.params.id);
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
  db.CurrentGoogleUsers = {}
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