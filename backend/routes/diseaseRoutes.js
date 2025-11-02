const express = require("express");
const multer = require("multer");
const path = require("path");
const { detectDisease } = require("../controllers/diseaseController");

const router = express.Router();

// Configure storage to keep original file extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), detectDisease);

module.exports = router;
