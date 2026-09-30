import os
import logging
from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi.errors import RateLimitExceeded

from rate_limiter import limiter
from database import SessionLocal, engine, Base, get_db
from models import Student, User
from schemas import StudentCreate, StudentUpdate, UserCreate, UserResponse, Token, LoginRequest, EmailRequest, UserSMTPUpdate, UserUpdate
from auth import hash_password, verify_password, create_access_token, get_current_user, require_admin
from email_utils import send_email_to_student, send_custom_smtp_email
from routers import ai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base.metadata.create_all(bind=engine)  # Removed for Alembic migrations

app = FastAPI()

app.state.limiter = limiter
from slowapi import _rate_limit_exceeded_handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(ai.router)

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.error(f"Integrity Error: {exc}")
    return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": "Database conflict: duplicate or invalid data."})

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Do not catch HTTPException here
    if isinstance(exc, HTTPException):
        raise exc
    logger.error(f"Unhandled Exception: {exc}")
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": f"Internal server error: {str(exc)}"})

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
# Only allow actual frontend URL in production, avoid wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
    email_lower = user.email.lower()
    existing_user = db.query(User).filter(User.email == email_lower).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
        
    new_user = User(
        name=user.name,
        username=email_lower,
        email=email_lower,
        hashed_password=hash_password(user.password),
        role="user" 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/api/v1/auth/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, login_req: LoginRequest, db: Session = Depends(get_db)):
    email_lower = login_req.email.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token = create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/api/v1/users/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user_update.name is not None:
        user.name = user_update.name
    if user_update.email is not None:
        existing_email = db.query(User).filter(User.email == str(user_update.email), User.id != user.id).first()
        if existing_email:
            raise HTTPException(status_code=409, detail="Email already registered by another user")
        user.email = str(user_update.email)
    
    if user_update.custom_fields_config is not None:
        user.custom_fields_config = user_update.custom_fields_config

    db.commit()
    db.refresh(user)
    return user


@app.put("/api/v1/users/me/smtp", response_model=UserResponse)
def update_user_smtp(
    smtp_update: UserSMTPUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if smtp_update.smtp_host is not None:
        user.smtp_host = smtp_update.smtp_host
    if smtp_update.smtp_port is not None:
        user.smtp_port = smtp_update.smtp_port
    if smtp_update.smtp_username is not None:
        user.smtp_username = smtp_update.smtp_username
    if smtp_update.smtp_password is not None:
        user.smtp_password = smtp_update.smtp_password

    db.commit()
    db.refresh(user)
    return user


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.post("/api/v1/students", status_code=status.HTTP_201_CREATED)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_student = Student(
        name=student.name,
        email=str(student.email),
        age=student.age,
        course=student.course,
        skills=student.skills,
        custom_fields=student.custom_fields,
        user_id=current_user.id
    )
    if student.roll_number:
        existing_roll = db.query(Student).filter(Student.user_id == current_user.id, Student.roll_number == student.roll_number).first()
        if existing_roll:
            raise HTTPException(status_code=400, detail="Roll Number already used by another student in your account.")
        new_student.roll_number = student.roll_number



    try:
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        return new_student
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Student with this ID or Email already exists.")


@app.get("/api/v1/students")
def get_students(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = None,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
        
    query = db.query(Student).filter(Student.user_id == current_user.id)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.name.ilike(search_pattern)) | 
            (Student.email.ilike(search_pattern)) | 
            (Student.course.ilike(search_pattern))
        )
        
    total = query.count()
    students = query.order_by(Student.id.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "items": students,
        "page": page,
        "limit": limit,
        "total": total
    }


@app.get("/api/v1/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student
 

@app.put("/api/v1/students/{student_id}")
def update_student(
    student_id: int,
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.user_id == current_user.id)
        .first()
    )

    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_student.name = student.name
    existing_student.email = str(student.email)
    existing_student.age = student.age
    existing_student.course = student.course
    existing_student.skills = student.skills
    if student.custom_fields is not None:
        existing_student.custom_fields = student.custom_fields
    if student.roll_number:
        existing_roll = db.query(Student).filter(Student.user_id == current_user.id, Student.roll_number == student.roll_number, Student.id != student_id).first()
        if existing_roll:
            raise HTTPException(status_code=400, detail="Roll Number already used by another student in your account.")
        existing_student.roll_number = student.roll_number

    db.commit()
    db.refresh(existing_student)

    return existing_student



@app.patch("/api/v1/students/{student_id}")
def patch_student(
    student_id: int,
    student: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.user_id == current_user.id)
        .first()
    )

    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_student, key, value)

    db.commit()
    db.refresh(existing_student)

    return existing_student


@app.delete("/api/v1/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = (
        db.query(Student)
        .filter(Student.id == student_id, Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()

    return None

@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_students = db.query(Student).filter(Student.user_id == current_user.id).count()
    return {
        "total_students": total_students,
        "new_students": total_students,  # Since we don't track historical drops yet, this is an aggregate count.
        "total_courses": 1 # Minimum 1 course for simple aggregation
    }


@app.post("/api/v1/students/{student_id}/send-email")
async def send_student_email(
    student_id: int,
    email_request: EmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.id == student_id, Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if not student.email:
        raise HTTPException(status_code=400, detail="Student does not have an email address")

    try:
        if current_user.has_smtp_configured:
            # Use Custom SMTP
            send_custom_smtp_email(
                email=student.email,
                subject=email_request.subject,
                body=email_request.body,
                smtp_host=current_user.smtp_host,
                smtp_port=current_user.smtp_port,
                smtp_username=current_user.smtp_username,
                smtp_password=current_user.smtp_password
            )
            return {"message": f"Email sent successfully via custom SMTP to {student.email}"}
        else:
            # No fallback, return an error
            raise HTTPException(
                status_code=400, 
                detail="Custom SMTP settings are not configured. Please go to Settings and configure your email credentials first."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send email to {student.email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")