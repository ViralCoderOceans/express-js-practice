var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express-js-practice' });
  res.status(200).send({
    success: true,
    data: {
      message: 'Welcome, Public Page...'
    }
  })
});

module.exports = router;
