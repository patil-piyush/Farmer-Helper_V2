from flask import Flask, jsonify
from flask_cors import CORS
from routes.crop_routes import crop_bp
from routes.disease_routes import disease_bp
from routes.dialogflow_bp import dialogflow_bp

# ---- Configuration ----
PROJECT_ID = "r-bot-khhk"  # ✅ Ensure this matches your Dialogflow project ID

# ---- App Initialization ----
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---- Blueprints Registration ----
app.register_blueprint(crop_bp)
app.register_blueprint(disease_bp)
app.register_blueprint(dialogflow_bp, url_prefix="/api/dialogflow")

# ---- Health Check Route ----
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running fine"}), 200


# ---- Entry Point ----
if __name__ == "__main__":
    print("🚀 Starting ML Services Backend on port 5001...")
    print("📡 Registered routes:")
    print("  - /api/crop")
    print("  - /api/disease")
    print("  - /api/dialogflow")
    print("  - /health")
    app.run(host="0.0.0.0", port=5001, debug=True)
