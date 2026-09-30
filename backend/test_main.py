import pytest
from fastapi.testclient import TestClient
from main import app, get_db
from database import Base, engine, SessionLocal
from models import User, Student

client = TestClient(app)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def setup_module(module):
    Base.metadata.create_all(bind=test_engine)

def teardown_module(module):
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="module")
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register():
    response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "user"

def test_duplicate_register():
    response = client.post("/api/v1/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 409

def test_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_invalid_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

@pytest.fixture
def auth_token():
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    if response.status_code != 200:
        raise Exception(f"Login failed in fixture: {response.status_code} {response.text}")
    return response.json()["access_token"]

def test_auth_me(auth_token):
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_create_student(auth_token):
    response = client.post("/api/v1/students", json={
        "name": "Student",
        "email": "student@example.com",
        "age": 20
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 201
    assert response.json()["name"] == "Student"

def test_get_students(auth_token):
    response = client.get("/api/v1/students", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 1

def test_update_student(auth_token):
    response = client.get("/api/v1/students", headers={"Authorization": f"Bearer {auth_token}"})
    student_id = response.json()["items"][0]["id"]
    
    response = client.put(f"/api/v1/students/{student_id}", json={
        "name": "Student Updated",
        "email": "student@example.com",
        "age": 21
    }, headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Student Updated"
    assert response.json()["age"] == 21

def test_delete_student(auth_token):
    response = client.get("/api/v1/students", headers={"Authorization": f"Bearer {auth_token}"})
    student_id = response.json()["items"][0]["id"]
    
    response = client.delete(f"/api/v1/students/{student_id}", headers={"Authorization": f"Bearer {auth_token}"})
    assert response.status_code == 204
