var express = require('express');
var router = express.Router();

router.use('/', (req, res, next) => {
  res.status(401).send({
    success: false,
    data: {
      message: 'Unauthorized, you do not have privilege to this endpoint.'
    }
  })
});

module.exports = router;
