from database import SessionLocal
from models import User, Student
from services.ai_service import AI_Service

db = SessionLocal()

# We need to simulate student_data for career recommendations
student_data = {
    "course": "BCA",
    "age": 19
}

try:
    res = AI_Service.generate_career_recommendations(student_data)
    print("Success:", res)
except Exception as e:
    print("Exception occurred:", type(e))
    print(e)
