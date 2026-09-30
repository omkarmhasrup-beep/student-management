from dotenv import load_dotenv
load_dotenv()
from services.ai_service import AI_Service

try:
    res = AI_Service.generate_resume_summary({'name': 'Omkar', 'age': 19, 'course': 'BCA'})
    print("Success:", res)
except Exception as e:
    print("Exception:", e)
