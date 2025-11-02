from flask import Flask, jsonify
from routes.crop_routes import crop_bp
from routes.disease_routes import disease_bp


app = Flask(__name__)

# Register all blueprints (routes)
app.register_blueprint(crop_bp)
app.register_blueprint(disease_bp)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running fine"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
