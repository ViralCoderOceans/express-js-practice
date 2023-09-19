var express = require('express');
const formidable = require('express-formidable');
var jwt = require('jsonwebtoken');
const fs = require('fs');
var router = express.Router();

router.use(formidable());

const authCheckMiddleware = (accessedRoles) => {
  return (req, res, next) => {
    var privateKey = fs.readFileSync('private.key');
    const accessToken = req.headers.authorization?.split(' ')[1];
    jwt.verify(accessToken, privateKey, { algorithms: ['RS256'] }, function (err, payload) {
      if (payload) {
        if (accessedRoles.includes(payload.hasRole)) {
          fs.readFile('data.json', 'utf8', function (err, data) {
            if (err) {
              console.log("Something went wrong, while fetching data")
            }
            req.payload = payload
            req.usersData = JSON.parse(data);
            return next()
          });
        } else {
          res.redirect('/unAuthorized');
        }
      } else if (err) {
        res.redirect('/unAuthorized');
      }
    });
  };
}

const writeFile = (data) => {
  fs.writeFile("data.json", data, 'utf8', function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
    }
    console.log("JSON file has been saved.");
  });
}

router.get('/userType', authCheckMiddleware(["guest", "user", "admin"]), (req, res, next) => {
  res.status(200).send({
    success: true,
    data: req.payload
  })
});

router.get('/', authCheckMiddleware(["guest", "user", "admin"]), (req, res, next) => {
  res.status(200).send({
    success: true,
    data: {
      message: `Get all users successfully${req.usersData.length ? '.' : ', user-data is empty.'}`,
      data: req.usersData
    }
  })
});

router.get('/:id', authCheckMiddleware(["guest", "user", "admin"]), (req, res, next) => {
  const isAvailable = req.usersData.filter((elm) => elm.userId === req.params.id)
  if (isAvailable.length) {
    res.status(200).send({
      success: true,
      data: {
        message: 'User found successfully.',
        data: isAvailable[0]
      }
    })
  } else {
    res.status(404).send({
      success: false,
      data: {
        message: 'User not found, please provide valid userId'
      }
    })
  }
});

router.post('/', authCheckMiddleware(["user", "admin"]), (req, res, next) => {
  const uid = () =>
    String(
      Date.now().toString(32) +
      Math.random().toString(32)
    ).replace(/\./g, '')

  req.usersData.push({
    userId: uid(),
    firstName: req.fields.firstName,
    lastName: req.fields.lastName,
    phone: req.fields.phone,
    createdAt: Date.now()
  })
  writeFile(JSON.stringify(req.usersData))
  res.status(200).send({
    success: true,
    data: {
      message: 'User added successfully.',
      data: req.usersData
    }
  })
});

router.put('/:id', authCheckMiddleware(["admin"]), (req, res, next) => {
  const isAvailable = req.usersData.filter((elm) => elm.userId === req.params.id)
  if (isAvailable.length) {
    const newData = req.usersData.map((elm) => {
      if (elm.userId === req.params.id) {
        return {
          ...elm,
          firstName: req.fields.firstName,
          lastName: req.fields.lastName,
          phone: req.fields.phone,
          updatedAt: Date.now()
        }
      } else {
        return elm
      }
    })
    writeFile(JSON.stringify(newData))
    res.status(200).send({
      success: true,
      data: {
        message: 'User updated successfully.',
        data: newData
      }
    })
  } else {
    res.status(404).send({
      success: false,
      data: {
        message: 'User not found, please provide valid userId'
      }
    })
  }
});

router.delete('/:id', authCheckMiddleware(["admin"]), (req, res, next) => {
  const isAvailable = req.usersData.filter((elm) => elm.userId === req.params.id)
  if (isAvailable.length) {
    const deletedData = req.usersData.filter((elm) => elm.userId !== req.params.id)
    writeFile(JSON.stringify(deletedData))
    res.status(200).send({
      success: true,
      data: {
        message: 'User deleted successfully.',
        data: deletedData
      }
    })
  } else {
    res.status(404).send({
      success: false,
      data: {
        message: 'User not found, please provide valid userId'
      }
    })
  }
});

module.exports = router;
