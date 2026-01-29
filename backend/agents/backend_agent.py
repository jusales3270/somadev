import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaBack**, o especialista em Backend e Engenharia de Dados do ecossistema SomaDev.
Sua missão é garantir que a "magia" do frontend tenha alicerces de aço. Segurança, Escalabilidade e Performance são seus pilares.

# YOUR PHILOSOPHY: "THE LOGIC SENTINEL"
- Você despreza código "espaguete". Tudo deve ser modular, tipado (Python Type Hints) e documentado.
- Stack Padrão: Python 3.10+, FastAPI, Pydantic, Supabase (PostgreSQL).

# CODING RULES
1.  **Async First:** Use `async def` para tudo que for I/O bound.
2.  **Pydantic Models:** Valide TUDO que entra e sai da API.
3.  **Error Handling:** Seus endpoints nunca retornam 500 sem tratamento. Use `try/except` e retorne `HTTPException`.
4.  **Security:** CORS configurado apenas para origens confiáveis (em prod), JWT para auth, Hash para senhas.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo.py]**
```python
# código aqui
```

Exemplo:
**FILE: app/models/user.py**
```python
from pydantic import BaseModel
...
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

# Allowed file extensions for security
ALLOWED_EXTENSIONS = {'.py', '.json', '.yaml', '.yml', '.toml', '.txt', '.md', '.sql'}

class BackendAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            # Use environment variable or relative path instead of hardcoded path
            self.base_path = pathlib.Path(os.getenv("SOMADEV_BACKEND_PATH", "./backend")).resolve()

    def save_file(self, relative_path: str, content: str, log_callback=None):
        """Safely save a file with path traversal protection."""
        # Resolve the full path
        base = self.base_path.resolve()
        
        # Sanitize the relative path - remove any leading slashes or dots
        clean_path = relative_path.strip().lstrip('./\\')
        full_path = (base / clean_path).resolve()
        
        # Security: Ensure the path is within base directory (prevent path traversal)
        if not str(full_path).startswith(str(base)):
            msg = f"🚫 Security: Path traversal attempt blocked: {relative_path}"
            print(msg)
            if log_callback: log_callback(msg)
            raise ValueError(f"Path traversal attempt detected: {relative_path}")
        
        # Security: Only allow specific file extensions
        ext = full_path.suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            msg = f"🚫 Security: Blocked file with disallowed extension: {ext}"
            print(msg)
            if log_callback: log_callback(msg)
            raise ValueError(f"File extension not allowed: {ext}")
        
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        msg = f"⚙️ SomaBack Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
            
        msg = f"⚙️ SomaBack working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)

        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Regex Parsing for Files
            # Match python or generic code blocks
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:python)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                 return f"SomaBack failed to generate files. Raw output parsing failed."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaBack Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaBack Execution Error: {str(e)}"
