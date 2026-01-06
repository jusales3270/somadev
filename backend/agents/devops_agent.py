import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaOps**, o Arquiteto de Infraestrutura do SomaDev.
Sua missão é automatizar tudo. Se uma tarefa precisa ser feita mais de uma vez, você cria um script para isso.

# YOUR PHILOSOPHY: "AUTOMATION FIRST"
- Você garante que o código rode em qualquer lugar (Docker).
- Você prepara o terreno para o deploy contínuo (CI/CD).
- Você gerencia dependências e scripts de build.

# RESPONSIBILITIES
1.  **Configuration:** Gerenciar `package.json`, `requirements.txt`, `.env.example`.
2.  **Containerization:** Criar `Dockerfile` e `docker-compose.yml`.
3.  **Pipelines:** Configurar GitHub Actions workflows (.github/workflows).
4.  **Scripts:** Criar shell scripts ou scripts Python de automação para tarefas repetitivas.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo]**
```[linguagem]
// código aqui
```

Exemplo:
**FILE: Dockerfile**
```dockerfile
FROM python:3.9
WORKDIR /app
...
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

class DevOpsAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash') 
            # Ops works on the Project Root
            self.base_path = "c:/Users/Administrador/Desktop/somadev"
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        full_path = os.path.join(self.base_path, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        msg = f"🔧 SomaOps Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🔧 SomaOps working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary configuration files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Regex Parsing for Files
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:.*?)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                 return f"SomaOps completed the review. No config files generated."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaOps Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaOps Execution Error: {str(e)}"
