const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001";

const detectDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // Create FormData to send to Flask service
        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path));

        // Send to Flask ML microservice
        const response = await axios.post(`${mlServiceUrl}/predict/disease`, formData, {
            headers: formData.getHeaders(),
        });

        // Clean up (optional): delete uploaded file from Node server after forwarding
        fs.unlink(req.file.path, err => {
            if (err) console.warn("⚠️ Unable to delete temp file:", err.message);
        });

        // Send Flask's response back to frontend
        res.json(response.data);
    } catch (error) {
        console.error("Error in disease detection:", error.message);

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(500).json({ error: "Failed to get disease prediction" });
    }
};

module.exports = { detectDisease };
