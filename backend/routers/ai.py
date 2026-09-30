from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from models import User, Student
from auth import get_current_user
from services.ai_service import AI_Service
from rate_limiter import limiter

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

class EmailDraftRequest(BaseModel):
    student_id: int
    instruction: str = Field(..., max_length=500)
    tone: str = "professional"

class AssistantRequest(BaseModel):
    query: str = Field(..., max_length=500)

class SearchRequest(BaseModel):
    query: str = Field(..., max_length=200)

class TranslateRequest(BaseModel):
    text: str = Field(..., max_length=2000)
    target_language: str = Field(..., max_length=50)

class ResumeSummaryRequest(BaseModel):
    student_id: int

class InterviewPrepRequest(BaseModel):
    student_id: int

class CareerRecommendationRequest(BaseModel):
    student_id: int

@router.post("/email-draft")
@limiter.limit("5/minute")
def generate_email_draft(request: Request, req: EmailDraftRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == req.student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    draft = AI_Service.generate_email_draft(student.name, req.instruction, req.tone)
    return draft

@router.post("/assistant")
@limiter.limit("10/minute")
def chat_assistant(request: Request, req: AssistantRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reply = AI_Service.chat_assistant(req.query, db, current_user.id)
    return reply

@router.post("/student-search")
@limiter.limit("10/minute")
def student_search(request: Request, req: SearchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    filters = AI_Service.parse_student_search(req.query)
    
    # filters is a dictionary returned from parse_student_search (StudentSearchFilters schema)
    query = db.query(Student).filter(Student.user_id == current_user.id)
    
    search = filters.get("search")
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(search_pattern)) | 
            (Student.email.ilike(search_pattern)) | 
            (Student.course.ilike(search_pattern))
        )
        
    course = filters.get("course")
    if course:
        query = query.filter(Student.course.ilike(f"%{course}%"))
        
    min_age = filters.get("min_age")
    if min_age is not None:
        query = query.filter(Student.age >= min_age)
        
    max_age = filters.get("max_age")
    if max_age is not None:
        query = query.filter(Student.age <= max_age)
        
    page = filters.get("page", 1)
    if page < 1:
        page = 1
    limit = filters.get("limit", 20)
    if limit < 1 or limit > 100:
        limit = 20
        
    total = query.count()
    students = query.order_by(Student.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": students,
        "page": page,
        "limit": limit,
        "total": total
    }

@router.get("/dashboard-insights")
@router.post("/dashboard-insights")
@limiter.limit("10/minute")
def dashboard_insights(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    total_students = db.query(Student).filter(Student.user_id == current_user.id).count()
    
    # Calculate real stats from database
    course_counts = db.query(Student.course, func.count(Student.id)).filter(Student.user_id == current_user.id, Student.course.isnot(None)).group_by(Student.course).all()
    
    avg_age_row = db.query(func.avg(Student.age)).filter(Student.user_id == current_user.id, Student.age.isnot(None)).first()
    average_age = float(avg_age_row[0]) if avg_age_row and avg_age_row[0] else None
    
    stats = {
        "total_students": total_students,
        "average_age": round(average_age, 1) if average_age else None,
        "course_counts": dict(course_counts)
    }
    insights = AI_Service.get_dashboard_insights(stats)
    return insights


@router.post("/resume-summary")
@limiter.limit("5/minute")
def generate_resume_summary(request: Request, req: ResumeSummaryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == req.student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data = {
        "name": student.name,
        "age": student.age,
        "course": student.course
    }
    summary = AI_Service.generate_resume_summary(student_data)
    return summary

@router.post("/interview-prep")
@limiter.limit("5/minute")
def generate_interview_prep(request: Request, req: InterviewPrepRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == req.student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data = {
        "course": student.course,
        "skills": student.custom_fields.get("skills") if student.custom_fields else None
    }
    questions = AI_Service.generate_interview_questions(student_data)
    return questions

@router.post("/career-recommendations")
@limiter.limit("5/minute")
def generate_career_recommendations(request: Request, req: CareerRecommendationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == req.student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data = {
        "course": student.course,
        "age": student.age
    }
    recommendations = AI_Service.generate_career_recommendations(student_data)
    return recommendations
