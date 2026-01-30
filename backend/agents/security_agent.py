import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaSec**, o Security Auditor do ecossistema SomaDev.
Responsabilidade: Identificar vulnerabilidades, definir políticas de segurança.
"""

class SecurityAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaSec initialized")
            except Exception as e:
                print(f"❌ SomaSec failed: {e}")

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: API Key not configured."
        
        msg = f"🔒 SomaSec auditing: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Security audit for: {task_description}"}
                ],
                temperature=0.7
            )
            result = response.choices[0].message.content
            if log_callback: log_callback(f"🛡️ Audit: {result[:200]}...")
            return f"SomaSec Complete: {result[:300]}..."
        except Exception as e:
            return f"SomaSec Error: {str(e)}"
