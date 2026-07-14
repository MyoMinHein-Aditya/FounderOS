from ai.llm import ask_ai

class FounderAgent:
    def chat(self, message, context, history):
        messages = [{
            "role": "system",
            "content": "You are FounderOS AI. You are a startup co-founder. Give practical advice. Be concise."
        }]

        messages += history
        messages.append({
            "role": "user",
            "content": f"Startup Context: {context} Question:{message}"
        })

        return ask_ai(messages)


founder_agent = FounderAgent()