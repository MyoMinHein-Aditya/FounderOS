import pytest
from repositories.user import UserRepository
from models.users import User

@pytest.fixture
def user_repo(db_session):
    return UserRepository(db_session)

def test_get_by_email(user_repo):
    # Setup
    user_repo.create({"email": "test@example.com", "name": "Test User", "password": "hash"})
    
    # Test
    user = user_repo.get_by_email("test@example.com")
    
    # Verify
    assert user is not None
    assert user.email == "test@example.com"
    assert user.name == "Test User"

def test_get_by_email_not_found(user_repo):
    user = user_repo.get_by_email("nonexistent@example.com")
    assert user is None
