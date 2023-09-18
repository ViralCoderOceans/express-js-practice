var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  res.status(401).send({
    success: false,
    data: {
      message: 'Unauthenticated, please provide valid accessToken.'
    }
  })
});

module.exports = router;
