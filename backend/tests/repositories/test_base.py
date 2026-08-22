import pytest
from sqlalchemy import Column, Integer, String
from database.base import Base
from repositories.base import BaseRepository

# A dummy model for testing BaseRepository
class DummyModel(Base):
    __tablename__ = "dummy_models"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

class DummyRepository(BaseRepository[DummyModel]):
    def __init__(self, db):
        super().__init__(DummyModel, db)

@pytest.fixture(scope="function")
def dummy_repo(db_session):
    return DummyRepository(db_session)

def test_create(dummy_repo):
    obj = dummy_repo.create({"name": "test"})
    assert obj.id is not None
    assert obj.name == "test"

def test_get_by_id(dummy_repo):
    obj = dummy_repo.create({"name": "test"})
    fetched = dummy_repo.get_by_id(obj.id)
    assert fetched is not None
    assert fetched.name == "test"

def test_get_all(dummy_repo):
    dummy_repo.create({"name": "test1"})
    dummy_repo.create({"name": "test2"})
    all_objs = dummy_repo.get_all()
    assert len(all_objs) == 2

def test_update(dummy_repo):
    obj = dummy_repo.create({"name": "old_name"})
    updated = dummy_repo.update(obj, {"name": "new_name"})
    assert updated.name == "new_name"
    
    fetched = dummy_repo.get_by_id(obj.id)
    assert fetched.name == "new_name"

def test_delete(dummy_repo):
    obj = dummy_repo.create({"name": "test"})
    result = dummy_repo.delete(obj.id)
    assert result is True
    
    fetched = dummy_repo.get_by_id(obj.id)
    assert fetched is None

def test_delete_non_existent(dummy_repo):
    result = dummy_repo.delete(999)
    assert result is False
