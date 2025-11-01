from flask import Blueprint, request, jsonify
from services.weather_service import predict_weather

weather_bp = Blueprint("weather_bp", __name__)

@weather_bp.route("/predict/weather", methods=["POST"])
def predict_weather_route():
    try:
        data = request.json
        result = predict_weather(
            data["humidity"],
            data["pressure"],
            data["temperature"]
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
