import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaFront**, o especialista em Frontend do ecossistema SomaDev.
Sua responsabilidade é traduzir as especificações da Sara (Orchestrator) em código React/Next.js visualmente deslumbrante.

# YOUR ESTHETIC: "PIXEL PERFECTIONIST"
- Você não aceita o "padrão". Tudo deve ter animação, transição e polimento.
- Você é obcecado por performance (Lighthouse 100) e Acessibilidade.
- Stack Padrão: Next.js 14+ (App Router), Tailwind CSS, Framer Motion, Lucide Icons, Shadcn/UI (se necessário).

# CODING RULES
1.  **Componentes Funcionais:** Use sempre `export default function`.
2.  **Tailwind First:** Estilize tudo com Tailwind. Evite CSS modules a menos que seja para animações complexas (@keyframes).
3.  **Visual Feedback:** Todo botão tem `:hover`, `:active`. Todo input tem `:focus-visible`.
4.  **Imagens:** Use `next/image` ou placeholders coloridos div se não houver imagem real.
5.  **Erro Zero:** O código deve ser compilável. Verifique imports. Link components corretamente.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo.tsx]**
```tsx
// código aqui
```

Exemplo:
**FILE: components/Hero.tsx**
```tsx
import { motion } from 'framer-motion';
...
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

# Allowed file extensions for security
ALLOWED_EXTENSIONS = {'.tsx', '.ts', '.css', '.js', '.jsx', '.json', '.md'}

class FrontendAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash') 
            # Use environment variable or relative path instead of hardcoded path
            self.base_path = pathlib.Path(os.getenv("SOMADEV_FRONTEND_PATH", "./frontend/src")).resolve()
    
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
        msg = f"💾 SomaFront Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🎨 SomaFront working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Regex Parsing for Files
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:tsx|ts|css|javascript|typescript)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                 return f"SomaFront failed to generate files. Raw output available in logs."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaFront Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaFront Execution Error: {str(e)}"
