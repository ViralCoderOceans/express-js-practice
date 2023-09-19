var express = require('express');
var router = express.Router();

const { MongoClient, ObjectId } = require('mongodb');
var url = "mongodb+srv://viralnakrani:viralnakrani@thevknakrani.dvqlomp.mongodb.net/";
const dbName = 'users';

router.get('/', async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    const collection = db.collection('users');
    const result = await collection.find({}).toArray();

    res.send(result);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    const collection = db.collection('users');

    const result = await collection.findOne(
      { _id: new ObjectId(req.params.id) }
    );

    res.send(result);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    const collection = db.collection('users');

    const result = await collection.insertOne(req.body);

    res.send(result);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    const collection = db.collection('users');

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );

    res.send(result);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const db = client.db(dbName);

    const collection = db.collection('users');

    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    res.json(result);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
