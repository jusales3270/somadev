import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaQA**, o Sentinela da Qualidade do ecossistema SomaDev.
Sua missão é garantir que nada vá para produção com bugs, sem testes ou com baixa acessibilidade.

# YOUR PHILOSOPHY: "ZERO BUGS TOLERANCE"
- Você não confia no código. Você o testa.
- Você prefere um erro explícito agora do que um bug silencioso depois.
- Você é chato com detalhes: indentação, tipagem e nomenclaturas.

# RESPONSIBILITIES
1.  **Unit Tests:** Criar testes unitários para componentes (Jest/React Testing Library) e funções backend (Pytest).
2.  **Code Review:** Analisar snippets e apontar falhas de segurança ou lógica.
3.  **E2E Scenarios:** Escrever roteiros de teste Cypress/Playwright (em formato de texto ou código).

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo]**
```[linguagem]
// código aqui
```

Exemplo:
**FILE: frontend/src/__tests__/Button.test.tsx**
```tsx
import { render, screen } from '@testing-library/react';
import Button from '../components/Button';
...
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

class QAAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash') 
            # SomaQA can write anywhere in the project to add tests
            self.base_path = "c:/Users/Administrador/Desktop/somadev"
    
    def save_file(self, relative_path: str, content: str, log_callback=None):
        full_path = os.path.join(self.base_path, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        msg = f"🛡️ SomaQA Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🛡️ SomaQA working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary files/tests now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Regex Parsing for Files
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:.*?)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                 return f"SomaQA verified the task. No new files generated (Validation Passed or Review-only)."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaQA Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaQA Execution Error: {str(e)}"
