const fs = require('fs');
var jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const { MONGO_DB_NAME, MONGO_URL } = require('../constants/constant');
var express = require('express');
const bodyParser = require('body-parser');
var router = express.Router();

router.use(bodyParser.json());

const connectToDatabase = async (req, res, next) => {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(MONGO_DB_NAME);
    const collection = db.collection('uni');

    req.data = collection;
    next();
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {
        message: `Internal Server Error - ${err}`
      }
    });
  }
};

const authCheckMiddleware = (accessedRoles) => {
  return (req, res, next) => {
    var privateKey = fs.readFileSync('private.key');
    const accessToken = req.headers.authorization?.split(' ')[1];
    jwt.verify(accessToken, privateKey, { algorithms: ['RS256'] }, function (err, payload) {
      if (payload) {
        if (accessedRoles.includes(payload.hasRole)) {
          return next()
        } else {
          res.redirect('/unAuthorized');
        }
      } else if (err) {
        res.redirect('/unAuthorized');
      }
    });
  };
}

//GEL ALL /
router.get('/', connectToDatabase, async (req, res) => {
  try {
    const result = await req.data.find({}).toArray();

    res.status(200).send({
      success: true,
      data: {
        message: 'Universities fetched successfully.',
        count: result.length,
        universities: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//GEL /top
router.get('/top', connectToDatabase, async (req, res) => {
  try {
    const result = await req.data.find({ world_rank: { $lte: 430 } }).toArray();

    res.status(200).send({
      success: true,
      data: {
        message: 'Top universities fetched successfully.',
        count: result.length,
        universities: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//GEL /locatedAtRegion
router.get('/locatedAtRegion', connectToDatabase, async (req, res) => {
  try {
    const result = await req.data.find(req.query).toArray();

    res.status(200).send({
      success: true,
      data: {
        message: `Universities located at ${req.query.region} fetched successfully.`,
        count: result.length,
        universities: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//GET /id
router.get('/:id', connectToDatabase, async (req, res) => {
  try {
    const result = await req.data.findOne({ _id: new ObjectId(req.params.id) });

    if (result) {
      res.status(200).send({
        success: true,
        data: {
          message: 'University fetched successfully.',
          university: result
        }
      })
    } else {
      res.status(400).send({
        success: true,
        data: {
          message: 'University not founded.'
        }
      })
    }
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//ADD UNI /
router.post('/', connectToDatabase, authCheckMiddleware(["admin"]), async (req, res) => {
  try {
    const result = await req.data.insertOne(req.body);

    res.status(200).send({
      success: true,
      data: {
        message: 'University created successfully.',
        data: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//EDIT UNI /id
router.put('/:id', connectToDatabase, authCheckMiddleware(["admin"]), async (req, res) => {
  try {
    var { _id, ...edits } = req.body
    const result = await req.data.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: edits }
    );

    res.status(200).send({
      success: true,
      data: {
        message: 'University updated successfully.',
        data: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

//DELETE UNI /id
router.delete('/:id', connectToDatabase, authCheckMiddleware(["admin"]), async (req, res) => {
  try {
    const result = await req.data.deleteOne({ _id: new ObjectId(req.params.id) });

    res.status(200).send({
      success: true,
      data: {
        message: 'University deleted successfully.',
        data: result
      }
    })
  } catch (err) {
    res.status(400).send({
      success: true,
      data: {
        message: `An error occur - ${err}`
      }
    })
  }
});

module.exports = router;
