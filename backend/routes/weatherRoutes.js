require("dotenv").config();
const express = require("express");
const { getWeather} = require("../controllers/weatherController");

const router = express.Router();

// Route: GET /api/weather?location=Pune
router.get("/", getWeather);

module.exports = router;