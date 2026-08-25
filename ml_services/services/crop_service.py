import joblib
import numpy as np
import pandas as pd
import boto3
import os
import threading
import time

BUCKET_NAME = "farmer-helper-storage-devops"
MODEL_KEY = "models/crop_recommendation_model.pkl"
ENCODER_KEY = "models/label_encoder.pkl"

LOCAL_MODEL_PATH = "models/crop_recommendation_model.pkl"
LOCAL_ENCODER_PATH = "models/label_encoder.pkl"

os.makedirs("models", exist_ok=True)

s3 = boto3.client("s3")

model = None
le = None
last_modified = None


def download_models():

    global model, le, last_modified

    try:

        response = s3.head_object(Bucket=BUCKET_NAME, Key=MODEL_KEY)
        current_modified = response["LastModified"]

        if last_modified != current_modified:

            print("New model detected in S3. Updating model...")

            s3.download_file(BUCKET_NAME, MODEL_KEY, LOCAL_MODEL_PATH)
            s3.download_file(BUCKET_NAME, ENCODER_KEY, LOCAL_ENCODER_PATH)

            model = joblib.load(LOCAL_MODEL_PATH)
            le = joblib.load(LOCAL_ENCODER_PATH)

            last_modified = current_modified

            print("Model reloaded successfully.")

    except Exception as e:

        print("Model update error:", e)


def model_watcher():

    while True:

        download_models()

        time.sleep(120)   # check every 2 minutes


# Initial model download
download_models()

# Start background watcher thread
threading.Thread(target=model_watcher, daemon=True).start()


def recommend_crop(N, P, K, temperature, humidity, ph, rainfall):

    try:

        feature_names = [
            'N', 'P', 'K',
            'temperature', 'humidity',
            'ph', 'rainfall'
        ]

        features = pd.DataFrame(
            [[N, P, K, temperature, humidity, ph, rainfall]],
            columns=feature_names
        )

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