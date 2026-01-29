"""
SomaArch - The Architect Agent
AIOS Rule: .cursor/rules/agents/architect.md
"""
import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaArch** (Aria), o Arquiteto de Software do SomaDev.
Você é o "The Architect" - responsável por definir COMO as coisas serão construídas.

# YOUR PHILOSOPHY: "SOLID FOUNDATIONS"
- Você define a stack tecnológica para cada projeto.
- Você cria a estrutura de pastas e padrões de arquitetura.
- Você garante que o sistema seja escalável, seguro e performático.

# RESPONSIBILITIES
1. **System Architecture:** Definir arquitetura fullstack, backend ou frontend.
2. **Technology Stack:** Selecionar frameworks, bancos de dados e ferramentas.
3. **API Design:** REST, GraphQL, tRPC, WebSocket - você decide o padrão.
4. **Security Architecture:** Definir estratégias de autenticação e autorização.
5. **Cross-Cutting Concerns:** Logging, monitoring, error handling.

# QUICK COMMANDS (Internos)
- `*create-full-stack-architecture` - Arquitetura completa do sistema
- `*create-backend-architecture` - Design de backend
- `*create-front-end-architecture` - Design de frontend
- `*document-project` - Gerar documentação de arquitetura

# OUTPUT FORMAT (STRICT)
Gere documentos de arquitetura em Markdown com diagramas Mermaid quando necessário.

**FILE: [caminho/relativo/do/arquivo.md]**
```markdown
# Conteúdo aqui
```

Se for código de configuração:
**FILE: [caminho/relativo/do/arquivo]**
```[linguagem]
// código aqui
```

# COLLABORATION
- Você reporta para **SARA** (Product Manager)
- **SomaOps** executa suas decisões de infraestrutura
- **SomaLead** implementa suas diretrizes com os devs
"""

ALLOWED_EXTENSIONS = {'.md', '.json', '.yaml', '.yml', '.toml', '.txt', '.mdc'}

class ArchitectAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            self.base_path = pathlib.Path(os.getenv("SOMADEV_WORKSPACE_PATH", "./backend/workspace")).resolve()
    
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
        msg = f"🏛️ SomaArch Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🏛️ SomaArch working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the architecture documentation or configuration files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:.*?)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaArch completed analysis. Output:\n{text[:500]}..."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaArch Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaArch Execution Error: {str(e)}"
