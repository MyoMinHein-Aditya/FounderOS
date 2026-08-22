import pytest
from repositories.goal import GoalRepository
from models.goal import Goal

@pytest.fixture
def repo(db_session):
    return GoalRepository(db_session)

def test_init(repo):
    assert repo is not None

def test_get_by_startup_id(repo):
    repo.create({'startup_id': 1, 'title': 'test'})
    res = repo.get_by_startup_id(1)
    assert len(res) == 1
    assert getattr(res[0], 'startup_id') == 1

def test_get_by_startup_id_empty(repo):
    res = repo.get_by_startup_id(999)
    assert len(res) == 0
