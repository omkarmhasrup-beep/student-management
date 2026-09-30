from dotenv import load_dotenv
load_dotenv()
import os
from google import genai
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
models = client.models.list()
for model in models:
    if "flash" in model.name:
        print(model.name)
