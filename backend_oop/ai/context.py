from models.startup import Startup
from models.goal import Goal
from models.task import Task

def get_context(db,current_user):
    user_id = current_user["user_id"]
    startups=(db.query(Startup).filter(Startup.owner_id==user_id).all())
    result = []
    for startup in startups:
        goals = (db.query(Goal).filter(Goal.startup_id==startup.id).all())
        tasks = (db.query(Task).filter(Task.startup_id==startup.id).all())
        result.append({
            "startup":startup.name,
            "stage":startup.stage,
            "industry":startup.industry,
            "goals":[g.title for g in goals],
            "tasks":[t.title for t in tasks],
        })
    return result