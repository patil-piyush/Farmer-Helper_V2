import joblib
import numpy as np
import pandas as pd

# Load model and encoder once
model = joblib.load("models/crop_recommendation_model.pkl")
le = joblib.load("models/label_encoder.pkl")

def recommend_crop(N, P, K, temperature, humidity, ph, rainfall):
    try:
        feature_names = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        features = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]], columns=feature_names)
        probabilities = model.predict_proba(features)[0]
        top_3_indices = np.argsort(probabilities)[-3:][::-1]
        top_3_crops = le.inverse_transform(top_3_indices)
        top_3_probs = probabilities[top_3_indices]

        return {
            "crops": top_3_crops.tolist(),
            "probs": top_3_probs.tolist()
        }
    except Exception as e:
        return {"error": str(e)}
