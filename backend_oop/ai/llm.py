from groq import Groq
import os
from dotenv import load_dotenv 

load_dotenv()

groq_key = os.getenv("GROQ_API_KEY")
if not groq_key:
    groq_key = "dummy_key_for_vercel_build"

client = Groq(api_key=groq_key)

def ask_ai(messages):
    response = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=messages)
    return response.choices[0].message.content