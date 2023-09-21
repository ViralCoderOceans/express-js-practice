var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var fs = require('fs');

var db = JSON.parse(fs.readFileSync('passportDB.json'));

passport.use(new LocalStrategy(function verify(username, password, cb) {
  var user = db.users.find((elm) => elm.username === username);
  if (!user && user.password === password) {
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
  return cb(null, user);
}));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user);
  });
});

var router = express.Router();


router.post('/login', (req, res, next) => {
  req.login(req.body, (err) => {
    if (err) { return next(err); }
    res.status(200).send({
      success: true,
      data: {
        message: 'Login successfully.'
      }
    })
  });
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.status(200).send({
      success: true,
      data: {
        message: 'Logout successfully.'
      }
    })
  });
});

router.post('/signup', (req, res, next) => {
  if (req.body.username && req.body.password) {
    const user = {
      id: Date.now(),
      username: req.body.username,
      password: req.body.password,
    }
    db.users.push(user);
    fs.writeFileSync('passportDB.json', JSON.stringify(db));

    req.login(user, (err) => {
      if (err) { return next(err); }
      res.status(200).send({
        success: true,
        data: {
          message: 'Signup successfully.'
        }
      })
    });
  } else {
    res.status(400).send({
      success: false,
      data: {
        message: 'Please provide valid details.'
      }
    })
  }
});

module.exports = router;