from flask import Blueprint, request, jsonify
from services.crop_service import recommend_crop

crop_bp = Blueprint("crop_bp", __name__)

@crop_bp.route("/predict/crop", methods=["POST"])
def predict_crop():
    try:
        data = request.json
        result = recommend_crop(
            data["N"], data["P"], data["K"],
            data["temperature"], data["humidity"],
            data["ph"], data["rainfall"]
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
