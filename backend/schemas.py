from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None
    custom_fields_config: list | None = None


class UserSMTPUpdate(BaseModel):
    smtp_host: str | None = Field(None, max_length=255)
    smtp_port: int | None = None
    smtp_username: str | None = Field(None, max_length=255)
    smtp_password: str | None = Field(None, max_length=255)


class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str | None = None
    role: str
    is_active: bool
    created_at: datetime
    has_smtp_configured: bool = False
    custom_fields_config: list | None = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class LoginRequest(BaseModel):
    email: str
    password: str


class StudentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=1, le=120)
    course: str | None = Field(None, max_length=100)
    roll_number: str | None = Field(None, max_length=50)
    skills: str | None = Field(None, max_length=500)
    custom_fields: dict | None = Field(default_factory=dict)

class StudentUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None
    age: int | None = Field(None, ge=1, le=120)
    course: str | None = Field(None, max_length=100)
    roll_number: str | None = Field(None, max_length=50)
    skills: str | None = Field(None, max_length=500)
    custom_fields: dict | None = None

class EmailRequest(BaseModel):
    subject: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)