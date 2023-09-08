var express = require('express');
const formidable = require('express-formidable');
var router = express.Router();
const fs = require('fs');
var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.use(formidable());

const getData = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (accessToken === 'helloWorld') {
    fs.readFile('data.json', 'utf8', function (err, data) {
      if (err) {
        console.log("Something went wrong, while fetching data")
      }
      req.usersData = JSON.parse(data);
      next()
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

router.use(getData);

const writeFile = (data) => {
  fs.writeFile("data.json", data, 'utf8', function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
    }
    console.log("JSON file has been saved.");
  });
}

router.get('/', getData, (req, res, next) => {
  res.cookie('myCookie', 'cookie-value', { maxAge: 3600000, httpOnly: true });
  res.status(200).send({
    success: true,
    data: {
      message: `Get all users successfully${req.usersData.length ? '.' : ', user-data is empty.'}`,
      data: req.usersData
    }
  })
});

router.get('/:id', getData, (req, res, next) => {
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

router.post('/', (req, res) => {
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
})

router.put('/:id', (req, res) => {
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
})

router.delete('/:id', (req, res) => {
  const isAvailable = req.usersData.filter((elm) => elm.userId === req.params.id)
  if (isAvailable.length) {
    const newData = req.usersData.filter((elm) => elm.userId !== req.params.id)
    writeFile(JSON.stringify(newData))
    res.status(200).send({
      success: true,
      data: {
        message: 'User deleted successfully.',
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
})

module.exports = router;
