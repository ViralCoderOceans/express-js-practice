var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github2');
var fs = require('fs');
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../constants/constant');

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: "/auth/github/callback",
  scope: ['user:email']
},
  function (_, __, profile, done) {
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

var router = express.Router();

router.get('/login', passport.authenticate('github'));

router.get('/userData/:id', (req, res, next) => {
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