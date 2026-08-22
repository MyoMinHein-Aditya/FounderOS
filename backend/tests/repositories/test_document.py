import pytest
from repositories.document import DocumentRepository
from models.document import Document

@pytest.fixture
def repo(db_session):
    return DocumentRepository(db_session)

def test_init(repo):
    assert repo is not None
