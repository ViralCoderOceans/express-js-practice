var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.status(200).send({
    success: true,
    data: {
      message: 'Welcome, User...'
    }
  })
});

module.exports = router;