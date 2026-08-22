import pytest
from repositories.note import NoteRepository
from models.note import Note

@pytest.fixture
def repo(db_session):
    return NoteRepository(db_session)

def test_init(repo):
    assert repo is not None
