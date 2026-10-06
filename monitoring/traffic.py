import time
import requests
import random
import threading

BASE_URL = "http://localhost:5000/api"

# Register/Login
credentials = {
    "fullname": "Traffic Bot",
    "email": f"bot_{int(time.time())}@example.com",
    "password": "password123"
}

print("Registering bot...")
res = requests.post(f"{BASE_URL}/auth/register", json=credentials)
if res.status_code != 201:
    print("Registration failed, trying login...")
    res = requests.post(f"{BASE_URL}/auth/login", json=credentials)

token = res.json().get('token')
if not token:
    print("Could not get token. Exiting.")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

def generate_traffic():
    while True:
        try:
            # 1. Good request: Crop recommendation
            crop_data = {
                "N": random.randint(50, 100),
                "P": random.randint(30, 60),
                "K": random.randint(30, 60),
                "temperature": random.uniform(20.0, 30.0),
                "humidity": random.uniform(50.0, 90.0),
                "ph": random.uniform(5.5, 7.5),
                "rainfall": random.uniform(100.0, 250.0)
            }
            requests.post(f"{BASE_URL}/crop", json=crop_data, headers=headers)

            # 2. Good request: Weather
            requests.post(f"{BASE_URL}/weather", json={"city": "Pune"}, headers=headers)

            # 3. Bad request: Missing fields to simulate 400s
            requests.post(f"{BASE_URL}/crop", json={"N": 10}, headers=headers)

            # 4. Unknown route to simulate 404s
            requests.get(f"{BASE_URL}/does_not_exist", headers=headers)
            
            # Health check (backend and ML directly)
            requests.get("http://localhost:5000/health")
            requests.get("http://localhost:5001/health")

        except Exception as e:
            print(f"Error: {e}")
        
        time.sleep(random.uniform(0.5, 2.0))

print("Generating traffic... Press Ctrl+C to stop.")
threads = []
for _ in range(3):  # run 3 threads for parallel traffic
    t = threading.Thread(target=generate_traffic, daemon=True)
    t.start()
    threads.append(t)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("Stopped.")
