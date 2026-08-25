const axios = require("axios");
const FormData = require("form-data");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");
require("dotenv").config();

const mlServiceUrl = process.env.ML_SERVICE_URL || "http://ml_service:5001";

const detectDisease = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const formData = new FormData();

        // send S3 URL instead of file
        // if bucket is public 
        // formData.append("image_url", req.file.location);

        // if bucket is private, generate a signed URL
        const command = new GetObjectCommand({
            Bucket: "farmer-helper-storage-devops",  // Replace with your bucket name
            Key: req.file.key
        });

        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 300
        });

        formData.append("image_url", signedUrl);
        
        
        const response = await axios.post(
            `${mlServiceUrl}/predict/disease`,
            formData,
            { headers: formData.getHeaders() }
        );

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