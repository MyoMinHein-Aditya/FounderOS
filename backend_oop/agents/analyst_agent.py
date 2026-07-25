from ai.llm import ask_ai

class AnalystAgent:
    """
    AnalystAgent analyzes startup metrics, financial performance, and operational data
    to provide actionable business intelligence and growth insights.
    """
    def analyze(self, data):
        messages = [
            {
                "role": "system",
                "content": (
                    "You are FounderOS AI Analyst. You specialize in analyzing startup metrics "
                    "(MRR, Churn, CAC, LTV, conversion rates) and providing concise, data-driven "
                    "insights. Focus on highlighting problem areas and identifying quick-win growth opportunities."
                )
            },
            {
                "role": "user",
                "content": f"Please perform a metric analysis on this startup data:\n\n{data}"
            }
        ]
        return ask_ai(messages)


analyst_agent = AnalystAgent()

