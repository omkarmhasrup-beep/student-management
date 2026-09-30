import requests
import json

url = "http://127.0.0.1:8000/api/v1/auth/register"
payload = json.dumps({
  "name": "om",
  "email": "omkarmhasrup492@gmail.com",
  "password": "Omkar@123"
})
headers = {
  'Content-Type': 'application/json'
}

try:
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)
    print(response.status_code)
except Exception as e:
    print(e)
