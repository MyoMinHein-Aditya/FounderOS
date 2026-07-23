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

    def generate_swot(self, startup_id: int, user_id: int) -> str:
        from services.startup_service import StartupService
        startup_service = StartupService(self.db)
        data = startup_service.compile_data(startup_id, user_id)
        if not data:
            return "Startup not found."
        prompt = f"Analyze this startup and generate an interactive SWOT positioning report. Output it in a clean, human-readable text block format (do NOT use raw markdown formatting, just clean bullet points and plain text sections):\n{data}"
        return founder_agent.chat(prompt, "No additional context.", [])

    def financial_analysis(self, startup_id: int, user_id: int, metrics_data: str) -> str:
        from services.startup_service import StartupService
        startup_service = StartupService(self.db)
        data = startup_service.compile_data(startup_id, user_id)
        if not data:
            return "Startup not found."
        prompt = f"Run a financial metric analysis computing burn rate, runway, MRR growth trajectory, and CAC/LTV recommendations based on these metrics: {metrics_data}. Output the result in a clean, human-readable text block format (do NOT use raw markdown formatting, just plain text bullets and text spacing):\n{data}"
        return founder_agent.chat(prompt, "No additional context.", [])

    def extract_minutes(self, notes_text: str) -> str:
        prompt = f"Extract actionable tasks, key decisions, and milestone deadlines from these raw meeting notes. Output the results in a clean, human-readable text list format (do NOT use raw markdown formatting, just clean bullet points):\n{notes_text}"
        return founder_agent.chat(prompt, "No additional context.", [])

    def write_document(self, doc_type: str, startup_id: int, user_id: int) -> str:
        from services.startup_service import StartupService
        startup_service = StartupService(self.db)
        data = startup_service.compile_data(startup_id, user_id)
        if not data:
            return "Startup not found."
        prompt = f"Write a detailed draft document (Type: {doc_type}) for this startup. Output it in clean, human-readable plain text sections (do NOT use raw markdown tags, keep spacing clean):\n{data}"
        return founder_agent.chat(prompt, "No additional context.", [])
