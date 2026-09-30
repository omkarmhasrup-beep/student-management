from dotenv import load_dotenv
load_dotenv()
from services.ai_service import AI_Service

try:
    res = AI_Service.translate_text('Hello, how are you?', 'Marathi')
    print("Success:", res)
except Exception as e:
    print("Exception:", e)
