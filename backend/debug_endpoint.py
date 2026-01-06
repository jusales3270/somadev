import requests
import json
import traceback

print("Sending request to http://localhost:8000/chat...")
try:
    response = requests.post(
        "http://localhost:8000/chat",
        headers={"Content-Type": "application/json"},
        json={"message": "Hello from debugging script"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
    traceback.print_exc()
