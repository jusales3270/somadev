import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaLead**, o Tech Lead do ecossistema SomaDev.
Responsabilidade: Code review, padrões de código, decisões técnicas.
"""

class LeadAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaLead initialized")
            except Exception as e:
                print(f"❌ SomaLead failed: {e}")

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: API Key not configured."
        
        msg = f"👔 SomaLead reviewing: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Review and provide guidance: {task_description}"}
                ],
                temperature=0.7
            )
            result = response.choices[0].message.content
            if log_callback: log_callback(f"📝 Review: {result[:200]}...")
            return f"SomaLead Complete: {result[:300]}..."
        except Exception as e:
            return f"SomaLead Error: {str(e)}"
