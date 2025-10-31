from flask import Flask, request, jsonify
import joblib
import numpy as np
import torch
from ultralytics import YOLO
import os

# Initialize Flask
app = Flask(__name__)

# ---------------------------
# ✅ LOAD ALL MODELS AT STARTUP
# ---------------------------
try:
    crop_model = joblib.load('models/crop_model.pkl')
    weather_model = joblib.load('models/weather_model.pkl')
    market_model = joblib.load('models/market_model.pkl')

    # Load YOLO for disease detection
    disease_model = YOLO('models/disease_model.pt')

    print("✅ All models loaded successfully.")
except Exception as e:
    print(f"⚠️ Error loading models: {e}")

# ---------------------------
# 🌾 1. Crop Recommendation
# ---------------------------
@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    try:
        data = request.json
        features = np.array([[data['temperature'], data['humidity'], data['ph'], data['rainfall']]])
        prediction = crop_model.predict(features)[0]
        return jsonify({'recommended_crop': str(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------
# 🌿 2. Disease Detection (YOLO)
# ---------------------------
@app.route('/predict/disease', methods=['POST'])
def predict_disease():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        file = request.files['image']
        save_path = os.path.join('uploads', file.filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(save_path)

        # Run YOLO prediction
        results = disease_model.predict(save_path)
        detected_classes = set()

        for result in results:
            for box in result.boxes:
                cls_name = disease_model.names[int(box.cls)]
                detected_classes.add(cls_name)

        return jsonify({'detected_diseases': list(detected_classes)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------
# ☁️ 3. Weather Prediction
# ---------------------------
@app.route('/predict/weather', methods=['POST'])
def predict_weather():
    try:
        data = request.json
        features = np.array([[data['humidity'], data['pressure'], data['temperature']]])
        prediction = weather_model.predict(features)[0]
        return jsonify({'predicted_weather': str(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------
# 📈 4. Market Price Prediction
# ---------------------------
@app.route('/predict/market', methods=['POST'])
def predict_market():
    try:
        data = request.json
        features = np.array([[data['crop_type'], data['month'], data['region_index']]])
        prediction = market_model.predict(features)[0]
        return jsonify({'predicted_price': float(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------
# 🩺 Health Check Route
# ---------------------------
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running fine 🚀'})

# ---------------------------
# 🏁 Run Server
# ---------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
