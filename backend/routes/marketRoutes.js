require("dotenv").config();
const express = require("express");
const { getMarketData } = require("../controllers/marketController");

const router = express.Router();



// Example route: /api/market?commodity=Tomato&state=Maharashtra&limit=50
router.get("/", getMarketData);

module.exports = router;