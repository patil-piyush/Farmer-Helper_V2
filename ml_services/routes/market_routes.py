from flask import Blueprint, request, jsonify
from services.market_service import predict_market

market_bp = Blueprint("market_bp", __name__)

@market_bp.route("/predict/market", methods=["POST"])
def predict_market_route():
    try:
        data = request.json
        result = predict_market(
            data["crop_type"],
            data["month"],
            data["region_index"]
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
