var express = require('express');
var cookieParser = require('cookie-parser');
const fs = require('fs');
var jwt = require('jsonwebtoken');
var router = express.Router();

router.use(cookieParser());

var db = JSON.parse(fs.readFileSync("loginData.json", "utf8"));
var privateKey = fs.readFileSync('private.key');

const loginCheckMiddleware = (req, res, next) => {
  var result = db.find((elm) => ((elm.username === req.query.username) && (elm.password === req.query.password)))
  if (result) {
    var { password, ...data } = result
    var token = jwt.sign(data, privateKey, { algorithm: 'RS256' });
    req.accessToken = token
    return next()
  }
  res.status(400).send({
    success: false,
    data: {
      message: 'Login failed, user not founded.'
    }
  })
};

router.get('/', loginCheckMiddleware, (req, res, next) => {
  res.cookie('accessToken', req.accessToken, { maxAge: 43200000 });
  res.status(200).send({
    success: true,
    data: {
      message: 'Login successfully.',
      accessToken: req.accessToken
    }
  })
});

module.exports = router;
