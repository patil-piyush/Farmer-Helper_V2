require("dotenv").config();
const axios = require("axios");

const BASE_URL = "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";

const getMarketData = async (req, res) => {
  try {
    const { state, district, commodity, limit, arrivalDate } = req.query;

    const params = {
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: limit || 100,
      "sort[Arrival_Date]": "desc",
    };

    if (state) params["filters[State]"] = state;
    if (district) params["filters[District]"] = district;
    if (commodity) params["filters[Commodity]"] = commodity;
    if (arrivalDate) params["filters[Arrival_Date]"] = arrivalDate;

    const { data } = await axios.get(BASE_URL, { params });

    res.json({
      count: data.records.length,
      latestDate: data.records?.[0]?.Arrival_Date,
      records: data.records,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { getMarketData };
