import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def call_groq(messages):
    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": messages,
        "temperature": 0.3
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    resp = requests.post(url, json=payload, headers=headers)
    data = resp.json()

    if "choices" not in data:
        print("\n\n🔥 GROQ ERROR 🔥")
        print(data)
        print("🔥 END ERROR 🔥\n\n")
        raise Exception("Groq no devolvió choices")

    return data["choices"][0]["message"]["content"]
