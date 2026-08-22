from fastapi import FastAPI, Depends, Request
import time
import requests
import json
import os
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
import models.audit_log

from controllers.auth import router as auth_router
from controllers.startup import router as startup_router
from controllers.goal import router as goal_router
from controllers.task import router as task_router
from controllers.dashboard import router as dashboard_router
from controllers.ai import router as agent_router
from controllers.notes import router as notes_router
from controllers.documents import router as documents_router
from controllers.notifications import router as notifications_router
from controllers.calendar import router as calendar_router
from routes.ws import router as ws_router
from controllers.collaboration import router as collaboration_router
from controllers.ai_features import router as ai_features_router
from controllers.crm import router as crm_router
from controllers.investor import router as investor_router
from middleware.rate_limit import rate_limit_middleware

app = FastAPI(dependencies=[Depends(rate_limit_middleware)])

@app.middleware("http")
async def brain_trace_middleware(request: Request, call_next):
    trace_id = request.headers.get("X-Trace-Id")
    start_time = time.time()
    
    response = await call_next(request)
    
    if trace_id and os.getenv("ENVIRONMENT", "dev") == "dev":
        duration = (time.time() - start_time) * 1000
        try:
            target = request.url.path
            requests.post(
                "http://localhost:5173/__brain_webhook",
                json={
                    "traceId": trace_id,
                    "source": "api_gateway",
                    "target": target,
                    "type": "API_CALL",
                    "duration": duration,
                    "status": response.status_code
                },
                timeout=0.1
            )
        except Exception:
            pass
            
    return response

# Base.metadata.create_all(bind=engine)

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

from config import get_settings
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

settings = get_settings()

from controllers.audit_log import router as audit_log_router
from controllers.export import router as export_router

app.include_router(auth_router, tags=["Authentication"])
app.include_router(startup_router, tags=["Startup"])
app.include_router(goal_router, tags=["Goals"])
app.include_router(task_router, tags=["Tasks"])
app.include_router(dashboard_router, tags=["Dashboard"])
app.include_router(agent_router, tags=["AI"])
app.include_router(notes_router, tags=["Notes"])
app.include_router(documents_router, tags=["Documents"])
app.include_router(notifications_router, tags=["Notifications"])
app.include_router(calendar_router, tags=["Calendar"])
app.include_router(ws_router, tags=["WebSockets"])
app.include_router(collaboration_router, tags=["Collaboration"])
app.include_router(ai_features_router, tags=["AI Workspace"])
app.include_router(crm_router, tags=["CRM"])
app.include_router(investor_router, tags=["Investor"])
app.include_router(export_router, tags=["Export"])
app.include_router(audit_log_router, tags=["Audit Log"])

# Global Exception Handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred", "type": "DatabaseError"},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "type": "ValidationError"},
    )

origins = ["*"] if settings.ENVIRONMENT == "dev" else ["https://yourproductiondomain.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)