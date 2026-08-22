import pytest
from repositories.startup import StartupRepository
from models.startup import Startup

@pytest.fixture
def repo(db_session):
    return StartupRepository(db_session)

def test_init(repo):
    assert repo is not None

def test_get_by_owner_id(repo):
    repo.create({'owner_id': 1, 'name': 'test'})
    res = repo.get_by_owner_id(1)
    assert len(res) == 1
    assert getattr(res[0], 'owner_id') == 1

def test_get_by_owner_id_empty(repo):
    res = repo.get_by_owner_id(999)
    assert len(res) == 0
