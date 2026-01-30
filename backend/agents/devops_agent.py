import os
import re
import pathlib
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaOps**, o especialista em DevOps do ecossistema SomaDev.
Sua responsabilidade é criar Dockerfiles, CI/CD, scripts de deploy.

# YOUR ESTHETIC: "AUTOMATION FIRST"
- Você automatiza tudo.
- Stack: Docker, GitHub Actions, Vercel, Railway.

# OUTPUT FORMAT (STRICT)
**FILE: [caminho/relativo/do/arquivo]**
```yaml ou dockerfile
// conteúdo aqui
```
"""

ALLOWED_EXTENSIONS = {'.yml', '.yaml', '.sh', '.Dockerfile', '.md', '.txt', '.json', ''}

class DevOpsAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaOps initialized with {self.model_name}")
            except Exception as e:
                print(f"❌ SomaOps failed: {e}")
        
        self.base_path = pathlib.Path(".").resolve()
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        base = self.base_path.resolve()
        clean_path = relative_path.strip().lstrip('./')
        full_path = (base / clean_path).resolve()
        
        if not str(full_path).startswith(str(base)):
            raise ValueError(f"Path traversal blocked: {relative_path}")
        
        os.makedirs(os.path.dirname(full_path) if os.path.dirname(full_path) else ".", exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        msg = f"💾 SomaOps Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: OpenAI API Key not configured."
        
        msg = f"🚀 SomaOps working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"TASK: {task_description}\n\nGenerate configuration files."}
                ],
                temperature=0.7
            )
            
            text = response.choices[0].message.content
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:yaml|dockerfile|sh|bash)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaOps failed. Output: {text[:500]}..."

            generated = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated.append(filename.strip())
                
            return f"SomaOps Created: {', '.join(generated)}"

        except Exception as e:
            return f"SomaOps Error: {str(e)}"
