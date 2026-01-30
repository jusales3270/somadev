import os
import re
import pathlib
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaMobile**, especialista em desenvolvimento mobile com React Native/Expo.

# OUTPUT FORMAT (STRICT)
**FILE: [caminho/relativo/do/arquivo.tsx]**
```tsx
// código
```
"""

ALLOWED_EXTENSIONS = {'.tsx', '.ts', '.js', '.json'}

class MobileAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaMobile initialized")
            except Exception as e:
                print(f"❌ SomaMobile failed: {e}")
        
        self.base_path = pathlib.Path("./mobile/src").resolve()
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        base = self.base_path.resolve()
        os.makedirs(base, exist_ok=True)
        full_path = (base / relative_path.strip().lstrip('./')).resolve()
        
        if not str(full_path).startswith(str(base)):
            raise ValueError("Path traversal blocked")
        
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        if log_callback: log_callback(f"💾 Saved: {full_path}")

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: API Key not configured."
        
        msg = f"📱 SomaMobile working on: {task_description}"
        if log_callback: log_callback(msg)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"TASK: {task_description}"}
                ],
                temperature=0.7
            )
            text = response.choices[0].message.content
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:tsx|ts)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaMobile failed. Output: {text[:300]}..."

            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                
            return f"SomaMobile Created: {len(files)} files"
        except Exception as e:
            return f"SomaMobile Error: {str(e)}"
