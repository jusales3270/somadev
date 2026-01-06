import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API Key not found")
else:
    genai.configure(api_key=api_key)
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
        
        # Write to file for the agent to read
        with open("valid_models.txt", "w") as f:
            for model in models:
                f.write(model + "\n")
                print(f"Found valid model: {model}")
                
    except Exception as e:
        print(f"Error listing models: {e}")
        with open("valid_models.txt", "w") as f:
            f.write(f"Error: {str(e)}")
