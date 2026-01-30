import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaArch**, o Arquiteto de Software do ecossistema SomaDev.
Responsabilidade: Definir arquitetura, tech stack, estrutura de pastas, design patterns.

# OUTPUT: Documentos de arquitetura em Markdown
"""

class ArchitectAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaArch initialized")
            except Exception as e:
                print(f"❌ SomaArch failed: {e}")

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: API Key not configured."
        
        msg = f"🏗️ SomaArch working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Create architecture for: {task_description}"}
                ],
                temperature=0.7
            )
            result = response.choices[0].message.content
            if log_callback: log_callback(f"📋 Architecture: {result[:200]}...")
            return f"SomaArch Complete: {result[:300]}..."
        except Exception as e:
            return f"SomaArch Error: {str(e)}"
