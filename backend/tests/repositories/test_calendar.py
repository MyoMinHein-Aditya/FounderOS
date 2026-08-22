import pytest
from repositories.calendar import CalendarRepository
from models.calendar_event import CalendarEvent

@pytest.fixture
def repo(db_session):
    return CalendarRepository(db_session)

def test_init(repo):
    assert repo is not None
