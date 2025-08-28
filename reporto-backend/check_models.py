# check_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the environment variables from .env file
load_dotenv()

try:
    # Configure the API with your key
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    print("API Key configured. Fetching available models...\n")

    # List all available models
    for m in genai.list_models():
        # We are interested in models that support the 'generateContent' method
        if 'generateContent' in m.supported_generation_methods:
            print(f"Found model: {m.name}")

except Exception as e:
    print(f"An error occurred: {e}")