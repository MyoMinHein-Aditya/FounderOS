from typing import List
from repositories.team import TeamRepository
from schemas.team import TeamCreate
from models.team import Team

class TeamService:
    def __init__(self, repo: TeamRepository):
        self.repo = repo

    def create(self, data: TeamCreate) -> Team:
        return self.repo.create(data.model_dump())

    def get_all(self) -> List[Team]:
        return self.repo.get_all()
