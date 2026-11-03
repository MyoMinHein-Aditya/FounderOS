
import logging
import os
import time

import requests

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from config import get_settings
from database.db import engine, SessionLocal
from database.base import Base

# Models
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

# Controllers
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
from controllers.collaboration import router as collaboration_router
from controllers.ai_features import router as ai_features_router
from controllers.crm import router as crm_router
from controllers.investor import router as investor_router
from controllers.audit_log import router as audit_log_router
from controllers.export import router as export_router

# Routes
from routes.ws import router as ws_router

# Middleware
from middleware.rate_limit import rate_limit_middleware


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FRONTEND_URL = "https://founder-os-frontend-kappa.vercel.app"

if settings.ENVIRONMENT == "dev":
    origins = ["*"]
else:
    origins = [FRONTEND_URL]


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="FounderOS API",
    description="FounderOS Backend API",
    version="1.0.0",
    dependencies=[Depends(rate_limit_middleware)]
)


# --------------------------------------------------
# REQUEST TRACE MIDDLEWARE
# --------------------------------------------------

@app.middleware("http")
async def brain_trace_middleware(request: Request, call_next):

    trace_id = request.headers.get("X-Trace-Id")
    start_time = time.time()

    response = await call_next(request)

    if (
        trace_id
        and settings.ENVIRONMENT == "dev"
    ):
        duration = (time.time() - start_time) * 1000

        try:
            requests.post(
                "http://localhost:5173/__brain_webhook",
                json={
                    "traceId": trace_id,
                    "source": "api_gateway",
                    "target": request.url.path,
                    "type": "API_CALL",
                    "duration": duration,
                    "status": response.status_code
                },
                timeout=0.1
            )
        except requests.RequestException:
            logger.debug("Development webhook unavailable")

    return response


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "FounderOS backend running",
        "status": "online"
    }


# --------------------------------------------------
# DATABASE CONNECTION TEST
# --------------------------------------------------

@app.get("/db-test")
def db_test():

    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "success",
            "message": "Database connection successful!",
            "dialect": engine.dialect.name
        }

    except SQLAlchemyError:
        logger.exception("Database connection test failed")

        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )

    finally:
        db.close()


# --------------------------------------------------
# ROUTERS
# --------------------------------------------------

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


# --------------------------------------------------
# GLOBAL EXCEPTION HANDLERS
# --------------------------------------------------

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(
    request: Request,
    exc: SQLAlchemyError
):
    logger.exception("Database error occurred")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Database error occurred",
            "type": "DatabaseError"
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "type": "ValidationError"
        }
    )


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# --------------------------------------------------
# APPLICATION READY
# --------------------------------------------------

logger.info("FounderOS backend initialized successfully")
