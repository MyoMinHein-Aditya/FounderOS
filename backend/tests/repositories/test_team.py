import pytest
from repositories.team import TeamRepository
from models.team import Team

@pytest.fixture
def repo(db_session):
    return TeamRepository(db_session)

def test_init(repo):
    assert repo is not None
