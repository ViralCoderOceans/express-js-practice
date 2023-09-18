var express = require('express');
var cookieParser = require('cookie-parser');
const { API_CODE } = require('../constants/constant');
var router = express.Router();
router.use(cookieParser());

const authCheckMiddleware = (req, res, next) => {
  if (req.payload.userType & API_CODE.ADMIN) {
    return next()
  }
  res.redirect('/unAuthorized');
};

router.get('/', authCheckMiddleware, (req, res, next) => {
  res.status(200).send({
    success: true,
    data: {
      message: 'Welcome, Admin...'
    }
  })
});

module.exports = router;