import pytest
from unittest.mock import patch, MagicMock
from services.startup_service import StartupService
from repositories.startup import StartupRepository
from schemas.startup import StartupCreate

@pytest.fixture
def service(db_session):
    repo = StartupRepository(db_session)
    return StartupService(repo, db_session)

def test_create(service):
    data = StartupCreate(name="Test Startup", description="Desc", stage="Seed", industry="Tech")
    startup = service.create(data, 1)
    assert startup.id is not None
    assert startup.name == "Test Startup"
    assert startup.owner_id == 1

def test_get_all_by_owner(service):
    data = StartupCreate(name="Test Startup", description="Desc", stage="Seed", industry="Tech")
    service.create(data, 1)
    data2 = StartupCreate(name="Another", description="Desc", stage="Seed", industry="AI")
    service.create(data2, 1)
    
    startups = service.get_all_by_owner(1)
    assert len(startups) == 2
    assert startups[0]["name"] == "Test Startup"
    assert startups[0]["total_goals"] == 0
    
    # search functionality
    startups_search = service.get_all_by_owner(1, search="AI")
    assert len(startups_search) == 1
    assert startups_search[0]["name"] == "Another"

def test_get_by_id(service):
    data = StartupCreate(name="Test", description="Desc", stage="Seed", industry="Tech")
    startup = service.create(data, 1)
    
    fetched = service.get_by_id(startup.id, 1)
    assert fetched is not None
    assert fetched.name == "Test"
    
    # wrong owner
    fetched_wrong = service.get_by_id(startup.id, 2)
    assert fetched_wrong is None

def test_compile_data(service):
    data = StartupCreate(name="Test", description="Desc", stage="Seed", industry="Tech")
    startup = service.create(data, 1)
    
    # Add a goal and task
    from models.goal import Goal
    from models.task import Task
    g = Goal(title="Goal 1", startup_id=startup.id)
    service.db.add(g)
    service.db.commit()
    t = Task(title="Task 1", startup_id=startup.id, status="Pending")
    service.db.add(t)
    service.db.commit()
    
    compiled = service.compile_data(startup.id, 1)
    assert compiled["name"] == "Test"
    assert "Goal 1" in compiled["goals"]
    assert compiled["tasks"][0]["title"] == "Task 1"
    
def test_compile_data_not_found(service):
    assert service.compile_data(999, 1) is None
