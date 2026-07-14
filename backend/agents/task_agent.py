from ai.llm import ask_ai
import json

class TaskAgent:
    """
    TaskAgent breaks down complex strategic goals into concrete, actionable, and
    measurable tactical tasks/milestones.
    """
    def generate(self, goal):
        messages = [
            {
                "role": "system",
                "content": (
                    "You are FounderOS Task Planner. Your job is to break down a startup goal "
                    "into 3 to 5 clear, sequential, and highly actionable milestone tasks. "
                    "You must reply ONLY with a valid JSON object matching the format:\n"
                    '{"tasks": ["task 1 description", "task 2 description", ...]}\n'
                    "Do not output markdown codeblocks, backticks, or any other explanations."
                )
            },
            {
                "role": "user",
                "content": f"Startup Goal to break down: {goal}"
            }
        ]
        response = ask_ai(messages)
        try:
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            return json.loads(cleaned)
        except Exception:
            # Fallback to default tasks if JSON parsing fails
            return {
                "tasks": [
                    "Define target customer profile and research competitors",
                    "Build and deploy a simplified MVP focusing on core value",
                    "Conduct user interviews and gather initial feedback"
                ]
            }


task_agent = TaskAgent()