const express = require("express");
const { recommendCrop } = require("../controllers/cropController");
const router = express.Router();

// POST /api/crop
router.post("/", recommendCrop);

module.exports = router;