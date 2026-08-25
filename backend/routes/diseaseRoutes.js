const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("../config/s3");
const { detectDisease } = require("../controllers/diseaseController");

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "farmer-helper-storage-devops",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "disease-images/" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

router.post("/", upload.single("image"), detectDisease);

module.exports = router;