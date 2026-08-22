import pytest
from unittest.mock import patch, MagicMock
from services.auth_service import AuthService
from repositories.user import UserRepository
from schemas.user import UserCreate, UserLogin
from models.users import User
from fastapi import HTTPException
from utils.security import hash_password, verify_password

@pytest.fixture
def service(db_session):
    repo = UserRepository(db_session)
    return AuthService(repo)

def test_register(service):
    data = UserCreate(name="Test", email="test@test.com", password="pass")
    user = service.register(data)
    assert user.id is not None
    assert user.email == "test@test.com"

def test_register_duplicate(service):
    data = UserCreate(name="Test", email="test@test.com", password="pass")
    service.register(data)
    with pytest.raises(HTTPException):
        service.register(data)

def test_login(service):
    data = UserCreate(name="Test", email="test@test.com", password="pass")
    service.register(data)
    
    login_data = UserLogin(email="test@test.com", password="pass")
    result = service.login(login_data)
    assert "access_token" in result
    assert result["token_type"] == "bearer"

def test_login_invalid(service):
    login_data = UserLogin(email="nonexistent@test.com", password="pass")
    with pytest.raises(HTTPException):
        service.login(login_data)
        
def test_get_user_by_id(service):
    data = UserCreate(name="Test", email="test@test.com", password="pass")
    u = service.register(data)
    
    fetched = service.get_user_by_id(u.id)
    assert fetched.id == u.id

def test_get_user_by_id_not_found(service):
    with pytest.raises(HTTPException):
        service.get_user_by_id(999)
