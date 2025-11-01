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

        const formData = new FormData();
        formData.append("image", fs.createReadStream(req.file.path));

        const response = await axios.post(`${mlServiceUrl}/predict/disease`, formData, {
            headers: formData.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error in disease detection:", error.message);
        res.status(500).json({ error: "Failed to get disease prediction" });
    }
};

module.exports = { detectDisease };
