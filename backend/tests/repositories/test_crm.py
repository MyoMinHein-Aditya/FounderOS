import pytest
from repositories.crm import CRMRepository
from models.crm import CRMLead

@pytest.fixture
def repo(db_session):
    return CRMRepository(db_session)

def test_init(repo):
    assert repo is not None
