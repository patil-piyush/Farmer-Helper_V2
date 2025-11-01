import os
from ultralytics import YOLO

# Load YOLO model
disease_model = YOLO("models/disease_model.pt")

def detect_disease(image_path):
    results = disease_model.predict(image_path)
    detected_classes = set()
    for result in results:
        for box in result.boxes:
            cls_name = disease_model.names[int(box.cls)]
            detected_classes.add(cls_name)
    return list(detected_classes)
