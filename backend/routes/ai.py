from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.dependencies import get_db
from utils.auth import get_current_user
from agents.founder_agent import founder_agent
from ai.memory import (get_history, save_message)
from ai.context import get_context

from schemas.chat import ChatRequest

router = APIRouter()

@router.post("/chat")
def chat(request: ChatRequest, db:Session=Depends(get_db), current_user=Depends(get_current_user)):
    user_id = current_user["user_id"]
    message = request.message
    context = get_context(db,current_user)
    history = get_history(db,user_id)
    response = founder_agent.chat(message,context,history)
    save_message(db, user_id, "user", message)
    save_message(db, user_id, "assistant", response)
    return {"response":response}

@router.get("/history")
def get_chat_history(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_id = current_user["user_id"]
    return get_history(db, user_id)