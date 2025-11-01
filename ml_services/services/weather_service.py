import joblib
import numpy as np

weather_model = joblib.load("models/weather_model.pkl")

def predict_weather(humidity, pressure, temperature):
    features = np.array([[humidity, pressure, temperature]])
    pred = weather_model.predict(features)[0]
    return {"predicted_weather": str(pred)}
