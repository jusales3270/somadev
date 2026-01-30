import os
import re
import pathlib
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaBack**, o especialista em Backend do ecossistema SomaDev.
Sua responsabilidade é traduzir as especificações da Sara (Orchestrator) em APIs Python/FastAPI robustas e seguras.

# YOUR ESTHETIC: "THE LOGIC SENTINEL"
- Você escreve código limpo, bem documentado e testável.
- Você é obcecado por segurança, validação de input e tratamento de erros.
- Stack Padrão: FastAPI, Pydantic, SQLAlchemy (se BD), python-dotenv.

# CODING RULES
1.  **Type Hints:** Use sempre type hints em funções e variáveis.
2.  **Pydantic Models:** Use Pydantic para request/response bodies.
3.  **Docstrings:** Toda função pública tem docstring.
4.  **Error Handling:** Use try/except com HTTPException(status_code, detail).
5.  **Segurança:** Nunca exponha stack traces, sanitize inputs.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo.py]**
```python
# código aqui
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

# Allowed file extensions for security
ALLOWED_EXTENSIONS = {'.py', '.json', '.yml', '.yaml', '.md', '.txt', '.sql'}

class BackendAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-5.2"
        
        if self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print(f"✅ SomaBack initialized with {self.model_name}")
            except Exception as e:
                print(f"❌ SomaBack failed to initialize: {e}")
        
        self.base_path = pathlib.Path(os.getenv("SOMADEV_BACKEND_PATH", "./backend")).resolve()
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        """Safely save a file with path traversal protection."""
        base = self.base_path.resolve()
        clean_path = relative_path.strip().lstrip('./')
        full_path = (base / clean_path).resolve()
        
        if not str(full_path).startswith(str(base)):
            msg = f"🚫 Security: Path traversal attempt blocked: {relative_path}"
            print(msg)
            if log_callback: log_callback(msg)
            raise ValueError(f"Path traversal attempt detected: {relative_path}")
        
        ext = full_path.suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            msg = f"🚫 Security: Blocked file with disallowed extension: {ext}"
            print(msg)
            if log_callback: log_callback(msg)
            raise ValueError(f"File extension not allowed: {ext}")
        
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        msg = f"💾 SomaBack Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.client:
            return "Error: OpenAI API Key not configured."
        
        msg = f"⚙️ SomaBack working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"TASK: {task_description}\n\nGenerate the necessary files now."}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.7
            )
            
            text = response.choices[0].message.content
            
            if log_callback: log_callback(f"📝 Generated response: {len(text)} characters")
            
            # Regex Parsing for Files
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:python)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaBack failed to generate files. Raw output: {text[:500]}..."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename.strip())
                
            return f"SomaBack Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            error_msg = f"SomaBack Execution Error: {str(e)}"
            print(error_msg)
            if log_callback: log_callback(error_msg)
            return error_msg
