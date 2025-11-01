const express = require("express");
const multer = require("multer");
const { detectDisease } = require("../controllers/diseaseController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), detectDisease);

module.exports = router;
