var express = require('express');
const fs = require('fs');
const mime = require('mime-types')
var router = express.Router();
const multer = require('multer')
const path = require("path")

const getImageData = (req, res, next) => {
  fs.readFile('imageData.json', 'utf8', function (err, data) {
    if (err) {
      console.log("Something went wrong, while fetching data")
    }
    req.imageData = JSON.parse(data);
    next()
  });
}

const writeImageFile = (data) => {
  fs.writeFile("imageData.json", data, 'utf8', function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
    }
    console.log("JSON file has been saved.");
  });
}

router.get('/', getImageData, (req, res, next) => {
  res.status(200).send({
    success: true,
    data: {
      message: `Get all images successfully${req.imageData.length ? '.' : ', user-data is empty.'}`,
      data: req.imageData
    }
  })
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, '..', 'uploads', 'images');
    cb(null, destinationPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "." + mime.extension(file.mimetype))
  }
})

const maxSize = 1000 * 1000 * 1000;

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    var filetypes = /mp4|pdf|webp|jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb("Error: File upload only supports the "
      + "following filetypes - " + filetypes);
  }
})

router.use(express.static('uploads'))

router.post('/upload', getImageData, upload.single('avatar'), function (req, res, next) {
  console.log('req.file: ', req.file)
  if (req.file) {
    req.imageData.push(req.file)
    writeImageFile(JSON.stringify(req.imageData))
    res.status(200).send({ message: 'File uploaded successfully.' })
  } else {
    res.status(400).send({ message: 'File not selected' })
  }
})

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/images', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

module.exports = router;
