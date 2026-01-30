import os
import re
import pathlib
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaDocs**, o Technical Writer do ecossistema SomaDev.
Responsabilidade: Gerar READMEs, documentação de API, guias de uso.

# OUTPUT FORMAT (STRICT)
**FILE: [caminho/arquivo.md]**
```markdown
// conteúdo
```
"""

ALLOWED_EXTENSIONS = {'.md', '.txt', '.json'}

class DocsAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaDocs initialized")
            except Exception as e:
                print(f"❌ SomaDocs failed: {e}")
        
        self.base_path = pathlib.Path("./docs").resolve()
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        base = self.base_path.resolve()
        os.makedirs(base, exist_ok=True)
        full_path = (base / relative_path.strip().lstrip('./')).resolve()
        
        if not str(full_path).startswith(str(base)):
            raise ValueError("Path traversal blocked")
        
        os.makedirs(os.path.dirname(full_path) if os.path.dirname(full_path) else ".", exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        if log_callback: log_callback(f"📄 Saved: {full_path}")

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: API Key not configured."
        
        msg = f"📝 SomaDocs working on: {task_description}"
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
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:markdown|md)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaDocs Complete: {text[:300]}..."

            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                
            return f"SomaDocs Created: {len(files)} files"
        except Exception as e:
            return f"SomaDocs Error: {str(e)}"
