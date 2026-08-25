const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "farmer-helper-storage-devops",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    }
  })
});

module.exports = upload;