var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var jwt = require('jsonwebtoken');
const fs = require('fs');
const { ROLES } = require('./constants/constant');

const checkAuthentication = (req, res, next) => {
  var privateKey = fs.readFileSync('private.key');
  const accessToken = req.headers.authorization?.split(' ')[1];
  jwt.verify(accessToken, privateKey, { algorithms: ['RS256'] }, function (err, payload) {
    if (payload) {
      if (ROLES[payload.hasRole].includes(req.originalUrl.split('/')[1])) {
        req.payload = payload
        return next()
      }
      res.redirect('/unAuthorized');
    } else if (err) {
      res.redirect('/unAuthorized');
    }
  });
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var filesRouter = require('./routes/files');
var mongoDBRouter = require('./routes/mongoDB');
var graphqlRouter = require('./routes/graphql');
var restApiRouter = require('./routes/restApi');
var loginRouter = require('./routes/login');
var dataTableRouter = require('./routes/dataTable');
var guestRouter = require('./routes/guest');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var unAuthorizedRouter = require('./routes/unAuthorized');

var app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//normal users crud operations
app.use('/users', usersRouter);

//file upload-download system
app.use('/files', filesRouter);

//connect mongodb to express
app.use('/mongoDB', mongoDBRouter);

//make crud operations using graphql
app.use('/graphql', graphqlRouter);

//make rest-api on the top og graphql
app.use('/restApi', restApiRouter);

//Authenticated and Authorized login system
app.use('/login', loginRouter);
app.use('/data-table', dataTableRouter);
app.use('/guest', checkAuthentication, guestRouter);
app.use('/user', checkAuthentication, userRouter);
app.use('/admin', checkAuthentication, adminRouter);
app.use('/unAuthorized', unAuthorizedRouter);

// const { MongoClient, ServerApiVersion } = require("mongodb");
// // Replace the placeholder with your Atlas connection string
// const uri = "mongodb+srv://viralnakrani:viralnakrani@thevknakrani.dvqlomp.mongodb.net/";
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri,  {
//         serverApi: {
//             version: ServerApiVersion.v1,
//             strict: true,
//             deprecationErrors: true,
//         }
//     }
// );
// async function run() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
