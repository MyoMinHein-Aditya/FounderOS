from sqlalchemy.orm import Session
from models.task import Task
from models.startup import Startup
from models.goal import Goal
from schemas.task import TaskCreate
from fastapi import HTTPException
from agents.task_agent import task_agent

class TaskService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: TaskCreate, owner_id: int) -> Task:
        startup = self.db.query(Startup).filter(Startup.id == data.startup_id, Startup.owner_id == owner_id).first()
        if not startup:
            raise HTTPException(status_code=403, detail="Startup not found or not owned by user")
        
        goal = self.db.query(Goal).filter(Goal.id == data.goal_id, Goal.startup_id == data.startup_id).first()
        if not goal:
            raise HTTPException(status_code=400, detail="Goal not found for this startup")

        task = Task(
            title=data.title,
            startup_id=data.startup_id,
            goal_id=data.goal_id,
            status="Pending"
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_tasks_by_startup(self, startup_id: int, owner_id: int, search: str = None, status: str = None, page: int = 1, limit: int = 10) -> list:
        startup = self.db.query(Startup).filter(Startup.id == startup_id, Startup.owner_id == owner_id).first()
        if not startup:
            raise HTTPException(status_code=403, detail="Startup not found or not owned by user")
        query = self.db.query(Task).filter(Task.startup_id == startup_id)
        if search:
            query = query.filter(Task.title.ilike(f"%{search}%"))
        if status:
            query = query.filter(Task.status == status)
        return query.offset((page - 1) * limit).limit(limit).all()

    def complete(self, task_id: int, owner_id: int) -> bool:
        task = self.db.query(Task).join(Startup).filter(Task.id == task_id, Startup.owner_id == owner_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.status = "Completed"
        self.db.commit()
        return True

    def generate_from_goal(self, goal_id: int, owner_id: int) -> list:
        goal = self.db.query(Goal).join(Startup).filter(Goal.id == goal_id, Startup.owner_id == owner_id).first()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
            
        result = task_agent.generate(goal.title)
        generated_tasks = result.get("tasks", [])
        
        created_tasks = []
        for t_title in generated_tasks:
            new_task = Task(
                title=t_title,
                startup_id=goal.startup_id,
                goal_id=goal.id,
                status="Pending"
            )
            self.db.add(new_task)
            created_tasks.append(new_task)
            
        self.db.commit()
        for t in created_tasks:
            self.db.refresh(t)
        return created_tasks
