import pytest
from repositories.task import TaskRepository
from models.task import Task

@pytest.fixture
def repo(db_session):
    return TaskRepository(db_session)

def test_init(repo):
    assert repo is not None

def test_get_by_startup_id(repo):
    repo.create({'startup_id': 1})
    res = repo.get_by_startup_id(1)
    assert len(res) == 1
    assert getattr(res[0], 'startup_id') == 1

def test_get_by_startup_id_empty(repo):
    res = repo.get_by_startup_id(999)
    assert len(res) == 0
