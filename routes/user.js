var express = require('express');
var cookieParser = require('cookie-parser');
const { API_CODE } = require('../constants/constant');
var router = express.Router();
router.use(cookieParser());

const authCheckMiddleware = (req, res, next) => {
  if (req.payload.userType & API_CODE.USER) {
    return next()
  }
  res.redirect('/unAuthorized');
};

router.get('/', authCheckMiddleware, (req, res, next) => {
  res.status(200).send({
    success: true,
    data: {
      message: 'Welcome, User...'
    }
  })
});

module.exports = router;