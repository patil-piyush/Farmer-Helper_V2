const axios = require("axios");
require("dotenv").config();

// Fallback to localhost for local development
const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

const recommendCrop = async (req, res) => {
    try {
        const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

        // Input validation
        if ([N, P, K, temperature, humidity, ph, rainfall].some(v => v === undefined)) {
            return res.status(400).json({ error: "All input fields are required" });
        }

        // Send data to Flask ML microservice
        const response = await axios.post(`${mlServiceUrl}/predict/crop`, req.body);

        // Send prediction result back to frontend
        return res.status(200).json(response.data);

    } catch (error) {
        console.error("Error connecting to ML service:", error.message);

        // Handle all possible errors gracefully
        if (error.response) {
            // Flask returned an error response (e.g., 400, 500)
            return res.status(error.response.status).json({
                error: error.response.data.error || "Error from ML service",
            });
        } else if (error.request) {
            // Flask service didn't respond
            return res.status(503).json({
                error: "ML service unavailable. Please try again later.",
            });
        } else {
            // Internal Node.js error
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};




module.exports = { recommendCrop };
