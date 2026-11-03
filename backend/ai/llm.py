
from groq import Groq
from config import get_settings

settings = get_settings()

if not settings.GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not configured.")

client = Groq(
    api_key=settings.GROQ_API_KEY
)

MODEL_NAME = "openai/gpt-oss-120b"


def ask_ai(messages):
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages
    )

    return response.choices[0].message.content
