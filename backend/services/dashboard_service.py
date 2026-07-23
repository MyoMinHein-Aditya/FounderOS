from sqlalchemy.orm import Session
from models.startup import Startup
from models.goal import Goal
from models.task import Task

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self, user_id: int) -> dict:
        total_startups = self.db.query(Startup).filter(Startup.owner_id == user_id).count()
        total_goals = self.db.query(Goal).join(Startup).filter(Startup.owner_id == user_id).count()
        completed_goals = self.db.query(Goal).join(Startup).filter(Startup.owner_id == user_id, Goal.status == "Completed").count()
        total_tasks = self.db.query(Task).join(Startup).filter(Startup.owner_id == user_id).count()
        completed_tasks = self.db.query(Task).join(Startup).filter(Startup.owner_id == user_id, Task.status == "Completed").count()

        recent_goals = self.db.query(Goal).join(Startup).filter(Startup.owner_id == user_id).order_by(Goal.id.desc()).limit(5).all()
        recent_goals_list = [{
            "id": g.id,
            "title": g.title,
            "status": g.status,
            "type": "goal"
        } for g in recent_goals]

        recent_tasks = self.db.query(Task).join(Startup).filter(Startup.owner_id == user_id).order_by(Task.id.desc()).limit(5).all()
        recent_tasks_list = [{
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "type": "task"
        } for t in recent_tasks]

        recent_stuff = sorted(
            recent_goals_list + recent_tasks_list,
            key=lambda x: x["id"],
            reverse=True
        )[:5]

        upcoming_tasks = self.db.query(Task).join(Startup).filter(Startup.owner_id == user_id, Task.status == "Pending").order_by(Task.id.asc()).limit(5).all()
        todos = [{
            "id": t.id,
            "title": t.title,
            "status": t.status
        } for t in upcoming_tasks]

        from models.calendar_event import CalendarEvent
        from models.goal import Goal
        upcoming_events = self.db.query(CalendarEvent).join(Startup).filter(Startup.owner_id == user_id).order_by(CalendarEvent.date.asc()).limit(3).all()
        events_list = []
        for e in upcoming_events:
            startup = self.db.query(Startup).filter(Startup.id == e.startup_id).first()
            events_list.append({
                "id": e.id,
                "title": e.title,
                "date": e.date,
                "startup_name": startup.name if startup else "N/A"
            })

        pending_goals = self.db.query(Goal).join(Startup).filter(Startup.owner_id == user_id, Goal.status == "Pending").order_by(Goal.id.asc()).limit(3).all()
        pending_goals_list = []
        for g in pending_goals:
            startup = self.db.query(Startup).filter(Startup.id == g.startup_id).first()
            pending_goals_list.append({
                "id": g.id,
                "title": g.title,
                "startup_name": startup.name if startup else "N/A"
            })

        return {
            "total_startups": total_startups,
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "recent_stuff": recent_stuff,
            "todos": todos,
            "pending_goals_list": pending_goals_list,
            "events_list": events_list
        }
