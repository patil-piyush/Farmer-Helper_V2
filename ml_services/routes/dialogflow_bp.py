from flask import Blueprint, request, jsonify
from google.cloud import dialogflow_v2 as dialogflow
import os

dialogflow_bp = Blueprint("dialogflow_bp", __name__)

# Path to your service account key
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "dialogflow-key.json"
PROJECT_ID = "r-bot-khhk"  # ✅ Use your actual Dialogflow project ID


@dialogflow_bp.route("/", methods=["POST"])
def dialogflow_reply():
    try:
        data = request.get_json()
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Create Dialogflow session
        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(PROJECT_ID, "local-session")

        # Build the text input
        text_input = dialogflow.TextInput(text=user_message, language_code="en")
        query_input = dialogflow.QueryInput(text=text_input)

        # Detect intent
        response = session_client.detect_intent(
            request={"session": session, "query_input": query_input}
        )

        # Extract the reply text
        reply_text = response.query_result.fulfillment_text or "I didn’t catch that. Could you rephrase?"

        # Extract intent (for integrating ML later)
        intent = response.query_result.intent.display_name

        # Optional: trigger custom logic for specific intents
        if intent.lower() == "crop_recommendation":
            # Placeholder for ML crop recommendation call
            # You can import your ML crop function and call it here.
            reply_text = "Sure! Please share your soil type, pH, and rainfall details."

        elif intent.lower() == "disease_detection":
            reply_text = "You can upload a crop image in the disease detection section."

        return jsonify({
            "reply": reply_text,
            "intent": intent,
            "confidence": response.query_result.intent_detection_confidence
        })

    except Exception as e:
        print("Dialogflow error:", e)
        return jsonify({"error": str(e)}), 500
