import joblib
import numpy as np

market_model = joblib.load("models/market_model.pkl")

def predict_market(crop_type, month, region_index):
    features = np.array([[crop_type, month, region_index]])
    pred = market_model.predict(features)[0]
    return {"predicted_price": float(pred)}
