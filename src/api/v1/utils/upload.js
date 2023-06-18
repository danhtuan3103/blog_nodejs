const multer = require("multer");

const uniqid = require("uniqid");

const storage = multer.diskStorage({
  // Directory of file
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  // name of file
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
