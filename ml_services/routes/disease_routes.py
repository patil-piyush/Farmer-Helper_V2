from flask import Blueprint, request, jsonify
import os
from services.disease_service import detect_disease

disease_bp = Blueprint("disease_bp", __name__)

@disease_bp.route("/predict/disease", methods=["POST"])
def predict_disease():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]
        os.makedirs("uploads", exist_ok=True)
        path = os.path.join("uploads", file.filename)
        file.save(path)

        detected = detect_disease(path)
        return jsonify({"detected_diseases": detected})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
