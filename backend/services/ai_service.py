from sqlalchemy.orm import Session
from agents.founder_agent import founder_agent
from ai.memory import get_history, save_message
from ai.context import get_context

class AIService:
    def __init__(self, db: Session):
        self.db = db

    def process_chat(self, message: str, current_user: dict) -> str:
        user_id = current_user["user_id"]
        context = get_context(self.db, current_user)
        history = get_history(self.db, user_id)
        
        response = founder_agent.chat(message, context, history)
        
        save_message(self.db, user_id, "user", message)
        save_message(self.db, user_id, "assistant", response)
        return response

    def get_history(self, user_id: int) -> list:
        return get_history(self.db, user_id)
