from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from database.base import Base
import models.users
import models.startup
import models.goal
import models.task
import models.note
import models.document
import models.notification
import models.calendar_event
import models.team
import models.team_member
import models.comment
import models.crm
from routes.auth import router as auth_router
from routes.startup import router as startup_router
from routes.goal import router as goal_router
from routes.task import router as task_router
from routes.dashboard import router as dashboard_router
from routes.ai import router as agent_router
from routes.notes import router as notes_router
from routes.documents import router as documents_router
from routes.notifications import router as notifications_router
from routes.calendar import router as calendar_router
from routes.ws import router as ws_router
from routes.collaboration import router as collaboration_router
from routes.ai_features import router as ai_features_router
from routes.crm import router as crm_router
from middleware.rate_limit import rate_limit_middleware

app = FastAPI(dependencies=[Depends(rate_limit_middleware)])

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "FounderOs backend running"}

@app.get("/db-test")
def db_test():
    from database.db import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        dialect = db.bind.dialect.name
        host = db.bind.url.host or "Local In-Memory"
        database = db.bind.url.database
        return {"status": "success", "message": "Database connection successful!", "dialect": dialect, "host": host, "database": database}
    except Exception as e:
        import traceback
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
    finally:
        db.close()

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(startup_router, prefix="/startup", tags=["Startup"])
app.include_router(goal_router, prefix="/goal", tags=["Goals"])
app.include_router(task_router, prefix="/task", tags=["Tasks"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(agent_router, prefix="/chat", tags=["AI"])
app.include_router(notes_router, prefix="/notes", tags=["Notes"])
app.include_router(documents_router, prefix="/documents", tags=["Documents"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
app.include_router(calendar_router, prefix="/calendar", tags=["Calendar"])
app.include_router(ws_router, tags=["WebSockets"])
app.include_router(collaboration_router, prefix="/collaboration", tags=["Collaboration"])
app.include_router(ai_features_router, prefix="/ai-features", tags=["AI Workspace"])
app.include_router(crm_router, prefix="/crm", tags=["CRM"])

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])