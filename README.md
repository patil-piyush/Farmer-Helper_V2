# Farmer Helper - AI for Farmers & Agriculture
#### Video Demo:  <URL HERE>
#### Description:

---

### Project Overview
Farmer Helper is an AI-powered platform that leverages machine learning, deep learning, and cloud integration to support farmers in daily agricultural decisions. It offers crop recommendations, plant disease and weed detection, weather forecasts, market insights, and an AI chatbot for instant assistance. The system aims to make farming smarter, more profitable, and less dependent on guesswork.

### Sentimental Problem Statement
Across India, millions of farmers face challenges like unpredictable weather, pest infestations, poor crop yield, and lack of access to real-time agricultural data. Many rely on traditional methods or local advice that may not reflect scientific accuracy. Farmer Helper bridges this gap by bringing AI, data science, and real-time analytics directly to the farmer’s fingertips. It transforms raw agricultural data into meaningful insights that can save time, money, and effort.

---

## System Architecture Overview
Farmer Helper uses a multi-layered microservice architecture for high scalability and modularity.

**Frontend (React + Vite + Tailwind CSS)**  
⬇  
**Backend (Node.js + Express)**  
⬇  
**ML Services (Python + Flask/FastAPI)**  
⬇  
**Machine Learning Models (Crop, Disease, Weed)**  
⬇  
**External APIs (Weather, Market Data)**  
⬇  
**Dialogflow Chatbot (AI Assistant)**  

Each layer communicates via RESTful APIs to maintain loose coupling, scalability, and independent development.

---

## A) FRONTEND (React + Vite + Tailwind CSS)

### Folder Structure
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── Dashboard/
│   ├── LoginPage/
│   ├── landing_page/
│   ├── hooks/
│   ├── App.jsx
│   ├── backend.js
│   ├── RequireAuth.jsx
│   └── unique_values.json
```

### Component Explanation
**Dashboard/**
- `CropSelection.jsx` – Collects soil and environmental parameters; fetches crop recommendations.
- `DiseaseDetection.jsx` – Allows image uploads; displays detected plant disease or weed result.
- `MarketPrice.jsx` – Displays live commodity prices.
- `Weather.jsx` – Fetches real-time forecasts.
- `Overview.jsx` – Dashboard summary showing insights.
- `Profile.jsx` – Manages user profile.
- `Sidebar.jsx` – Navigation bar.
- `Dashboard.jsx` – Main integration layout.

**landing_page/**
- `Hero.jsx` – Platform mission and benefits.
- `Features.jsx` – Highlights AI-based tools.
- `Feedback.jsx` – Displays testimonials.
- `Stats.jsx` – Shows statistics.

**LoginPage/**
- `Login.jsx`, `SignUp.jsx`, `RequireAuth.jsx` – Handle authentication and route protection.

**hooks/**
- `useReveal.js` – Animation for UI appearance.

---

## B) BACKEND (Node.js + Express)

### Purpose
Acts as the API Gateway managing communication between frontend, ML services, database, and external APIs.

### Folder Structure
```
backend/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── uploads/
└── server.js
```

### Controllers
- `authController.js` – Handles login/signup.
- `cropController.js` – Sends soil data to ML microservice.
- `diseaseController.js` – Handles disease/weed detection.
- `marketController.js` – Fetches market price data.
- `userController.js` – Manages user profiles.
- `weatherController.js` – Fetches weather data.

### Middleware
- `authMiddleware.js` – JWT verification.

### Models
- `User.js` – Stores user and farm data.

---

## C) ML SERVICES (Python + Flask/FastAPI)

### Purpose
Hosts ML and DL models independently as microservices for modular deployment.

### Folder Structure
```
ml_services/
├── models/
├── routes/
├── services/
├── uploads/
├── app.py
├── requirements.txt
└── dialogflow-key.json
```

### Models Used
- `crop_recommendation_model.pkl` – Predicts optimal crop.
- `disease_model.pt` (YOLOv8) – Detects plant diseases.
- `weed_detection_model.pt` (YOLOv8) – Detects weeds.
- `label_encoder.pkl` – Maps outputs to readable names.

### Routes
- `crop_routes.py` – `/predict_crop` endpoint.
- `disease_routes.py` – `/detect_disease` endpoint.
- `dialogflow_bp.py` – Chatbot integration.

### Services
- `crop_service.py` – Handles preprocessing and prediction.
- `disease_service.py` – Runs YOLOv8 inference.

---

## Chatbot Integration (Dialogflow)
- Supports Marathi, Hindi, English.
- Integrated via Node.js backend using service key.
- Responds to natural queries like:
  - “Which crop is best for my soil?”
  - “What disease is on my tomato plant?”
  - “Show me market price of wheat.”
  - “What will be the weather tomorrow?”

### Features
- Natural Language Understanding (NLU).
- Contextual memory for follow-ups.
- Real-time ML integration.

---

## Live API Integrations
- **Weather API:** OpenWeatherMap.
- **Market Price API:** Agmarknet.
- **Geolocation API:** For region-specific insights.

---

## Data Flow
1. User interacts with frontend.  
2. Request sent to backend → controller.  
3. Backend forwards data/image to ML microservice.  
4. ML model returns result.  
5. Backend sends formatted response to frontend.  
6. Frontend displays prediction or chatbot message.

---

## Security Measures
- JWT Authentication  
- CORS Protection  
- Multer for safe uploads  
- bcrypt for password hashing  

---

## Key Advantages
- Modular and scalable architecture.  
- AI-driven insights.  
- Independent microservice deployment.  
- Extensible for IoT and drone data integration.  

---

## Future Enhancements
- IoT soil sensor integration.  
- NLP-based advanced chatbot.  
- Predictive yield estimation.  
- Mobile app version for offline access.  

---

## Summary
Farmer Helper bridges the gap between traditional farming and modern agriculture through AI innovation. With crop intelligence, disease detection, market awareness, and real-time chatbot support — it’s not just an app, it’s a **digital partner** for every farmer’s success journey.
