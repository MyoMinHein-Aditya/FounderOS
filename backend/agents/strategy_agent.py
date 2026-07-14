from ai.llm import ask_ai

class StrategyAgent:
    """
    StrategyAgent focuses on long-term growth strategies, market positioning,
    competitive advantage, and operational roadmap planning for startups.
    """
    def analyze(self, data):
        messages = [
            {
                "role": "system",
                "content": (
                    "You are FounderOS AI Strategy Co-founder. You specialize in high-level business strategy, "
                    "competitive differentiation, market entry, and funding advice. Give strategic recommendations "
                    "categorized clearly into Strengths, Weaknesses, and critical Next Strategic Moves."
                )
            },
            {
                "role": "user",
                "content": f"Analyze this startup venture and advise on the next strategic steps:\n\n{data}"
            }
        ]
        return ask_ai(messages)


strategy_agent = StrategyAgent()