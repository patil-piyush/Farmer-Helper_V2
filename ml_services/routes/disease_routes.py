import requests
from flask import Blueprint, request, jsonify
import os
from services.disease_service import detect_disease

disease_bp = Blueprint("disease_bp", __name__)

@disease_bp.route("/predict/disease", methods=["POST"])
def predict_disease():
    try:

        image_url = request.form.get("image_url")

        if not image_url:
            return jsonify({"error": "No image_url provided"}), 400

        os.makedirs("temp", exist_ok=True)

        temp_path = os.path.join("temp", "image.jpg")

        # download image from S3
        response = requests.get(image_url)

        if response.status_code != 200:
            return jsonify({"error": "Failed to download image from S3"}), 400

        with open(temp_path, "wb") as f:
            f.write(response.content)

        if os.path.getsize(temp_path) == 0:
            return jsonify({"error": "Downloaded image is empty"}), 400

        detected = detect_disease(temp_path)

        os.remove(temp_path)

        return jsonify({"detected_diseases": detected})

    except Exception as e:
        return jsonify({"error": str(e)}), 500