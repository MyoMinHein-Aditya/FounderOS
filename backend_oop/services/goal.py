from typing import List
from repositories.goal import GoalRepository
from schemas.goal import GoalCreate
from models.goal import Goal

class GoalService:
    def __init__(self, repo: GoalRepository):
        self.repo = repo

    def create_goal(self, data: GoalCreate) -> Goal:
        return self.repo.create(data.model_dump())

    def get_goals(self) -> List[Goal]:
        return self.repo.get_all()

    def mark_completed(self, goal_id: int) -> Goal:
        goal = self.repo.get_by_id(goal_id)
        if goal:
            return self.repo.update(goal, {"status": "Completed"})
        return None
