from sqlalchemy.orm import Session
from models.startup import Startup
from models.goal import Goal
from models.task import Task
from schemas.startup import StartupCreate

class StartupService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: StartupCreate, owner_id: int) -> Startup:
        startup = Startup(
            name=data.name,
            description=data.description,
            stage=data.stage,
            industry=data.industry,
            owner_id=owner_id
        )
        self.db.add(startup)
        self.db.commit()
        self.db.refresh(startup)
        return startup

    def get_all_by_owner(self, owner_id: int) -> list:
        startups = self.db.query(Startup).filter(Startup.owner_id == owner_id).all()
        return [self._format_startup(s) for s in startups]

    def get_by_id(self, startup_id: int, owner_id: int) -> Startup:
        return self.db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == owner_id).first()

    def compile_data(self, startup_id: int, owner_id: int) -> dict:
        startup = self.get_by_id(startup_id, owner_id)
        if not startup:
            return None
        goals = self.db.query(Goal).filter(Goal.startup_id == startup.id).all()
        tasks = self.db.query(Task).filter(Task.startup_id == startup.id).all()
        return {
            "name": startup.name,
            "description": startup.description,
            "stage": startup.stage,
            "industry": startup.industry,
            "goals": [g.title for g in goals],
            "tasks": [{"title": t.title, "status": t.status} for t in tasks]
        }

    def _format_startup(self, s: Startup) -> dict:
        total_goals = self.db.query(Goal).filter(Goal.startup_id == s.id).count()
        completed_goals = self.db.query(Goal).filter(Goal.startup_id == s.id, Goal.status == "Completed").count()
        total_tasks = self.db.query(Task).filter(Task.startup_id == s.id).count()
        completed_tasks = self.db.query(Task).filter(Task.startup_id == s.id, Task.status == "Completed").count()
        return {
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "stage": s.stage,
            "industry": s.industry,
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "goal_pct": self._calc_pct(completed_goals, total_goals),
            "task_pct": self._calc_pct(completed_tasks, total_tasks)
        }

    def _calc_pct(self, completed: int, total: int) -> int:
        return int((completed / total) * 100) if total > 0 else 0
