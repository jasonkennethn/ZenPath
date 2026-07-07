import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key configured: {api_key[:5]}...{api_key[-5:] if api_key else ''}")

genai.configure(api_key=api_key)

try:
    models = genai.list_models()
    print("Available models:")
    for m in models:
        print(f"- {m.name} (supports: {m.supported_generation_methods})")
except Exception as e:
    print(f"Error listing models: {e}")
