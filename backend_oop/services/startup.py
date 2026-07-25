from typing import List
from repositories.startup import StartupRepository
from schemas.startup import StartupCreate
from models.startup import Startup

class StartupService:
    def __init__(self, repo: StartupRepository):
        self.repo = repo

    def create_startup(self, owner_id: int, data: StartupCreate) -> Startup:
        startup_data = data.model_dump()
        startup_data["owner_id"] = owner_id
        return self.repo.create(startup_data)

    def get_user_startups(self, owner_id: int) -> List[Startup]:
        return self.repo.get_by_owner_id(owner_id)
