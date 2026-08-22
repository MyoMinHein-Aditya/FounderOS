import pytest
from unittest.mock import patch, MagicMock
from services.task_service import TaskService
from repositories.task import TaskRepository
from schemas.task import TaskCreate
from models.startup import Startup
from models.goal import Goal
from fastapi import HTTPException

@pytest.fixture
def service(db_session):
    repo = TaskRepository(db_session)
    return TaskService(repo, db_session)

def setup_data(db):
    s = Startup(name="Test", owner_id=1)
    db.add(s)
    db.commit()
    db.refresh(s)
    g = Goal(title="Goal", startup_id=s.id)
    db.add(g)
    db.commit()
    db.refresh(g)
    return s, g

def test_create(service, db_session):
    s, g = setup_data(db_session)
    data = TaskCreate(title="Test Task", startup_id=s.id, goal_id=g.id)
    task = service.create(data, 1)
    assert task.id is not None
    assert task.title == "Test Task"

def test_create_wrong_owner(service, db_session):
    s, g = setup_data(db_session)
    data = TaskCreate(title="Test Task", startup_id=s.id, goal_id=g.id)
    with pytest.raises(HTTPException):
        service.create(data, 2)

def test_create_wrong_goal(service, db_session):
    s, _ = setup_data(db_session)
    data = TaskCreate(title="Test Task", startup_id=s.id, goal_id=999)
    with pytest.raises(HTTPException):
        service.create(data, 1)

def test_get_tasks_by_startup(service, db_session):
    s, g = setup_data(db_session)
    data = TaskCreate(title="Test Task 1", startup_id=s.id, goal_id=g.id)
    service.create(data, 1)
    data = TaskCreate(title="Test Task 2", startup_id=s.id, goal_id=g.id)
    service.create(data, 1)
    
    tasks = service.get_tasks_by_startup(s.id, 1)
    assert len(tasks) == 2
    
    tasks = service.get_tasks_by_startup(s.id, 1, search="1")
    assert len(tasks) == 1

def test_complete(service, db_session):
    s, g = setup_data(db_session)
    data = TaskCreate(title="Test Task", startup_id=s.id, goal_id=g.id)
    task = service.create(data, 1)
    
    service.complete(task.id, 1)
    db_session.refresh(task)
    assert task.status == "Completed"

@patch('agents.task_agent.task_agent.generate')
def test_generate_from_goal(mock_generate, service, db_session):
    s, g = setup_data(db_session)
    mock_generate.return_value = {"tasks": ["Gen Task 1", "Gen Task 2"]}
    
    tasks = service.generate_from_goal(g.id, 1)
    assert len(tasks) == 2
    assert tasks[0].title == "Gen Task 1"
    assert tasks[1].title == "Gen Task 2"
