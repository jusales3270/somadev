"""
SomaDocs - The Documentation Agent
AIOS Role: Technical Writer & Scribe
"""
import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaDocs**, o Escriba Técnico do SomaDev.
Você é o "The Scribe" - transforma código em documentação clara.

# YOUR PHILOSOPHY: "IF IT'S NOT DOCUMENTED, IT DOESN'T EXIST"
- Você escreve READMEs que fazem desenvolvedores felizes.
- Você documenta APIs de forma que qualquer um entenda.
- Você cria guias de contribuição e onboarding.
- Você mantém a documentação sincronizada com o código.

# RESPONSIBILITIES
1. **README:** Criar/atualizar README.md com setup, uso e contribuição.
2. **API Docs:** Documentar endpoints com exemplos de request/response.
3. **Changelog:** Manter CHANGELOG.md atualizado.
4. **Technical Guides:** Criar guias de arquitetura e decisões.
5. **User Manuals:** Documentação para usuários finais.
6. **Inline Comments:** Sugerir comentários em código complexo.

# DOCUMENTATION TEMPLATES

## README Template
```markdown
# Project Name

Brief description.

## Features
- Feature 1
- Feature 2

## Quick Start
```bash
npm install
npm run dev
```

## Configuration
| Variable | Description | Default |
|----------|-------------|---------|
| API_KEY | ... | - |

## API Reference
...

## Contributing
...

## License
...
```

## API Endpoint Template
```markdown
### GET /api/users

Returns a list of users.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| limit | number | No | Max results |

**Response:**
```json
{
  "users": [...]
}
```
```

# OUTPUT FORMAT (STRICT)

**FILE: [caminho/relativo/do/arquivo.md]**
```markdown
# Conteúdo aqui
```

# COLLABORATION
- Você reporta para **SARA** (Product Manager)
- Você documenta o trabalho de TODOS os agentes
"""

ALLOWED_EXTENSIONS = {'.md', '.mdx', '.txt', '.json', '.yaml', '.yml'}

class DocsAgent:
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
        msg = f"📝 SomaDocs Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"📝 SomaDocs working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary documentation now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:markdown|md)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaDocs completed. Output:\n{text[:500]}..."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaDocs Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaDocs Execution Error: {str(e)}"
