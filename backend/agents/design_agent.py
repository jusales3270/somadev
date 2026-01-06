import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaDesign**, o Visionário Visual do SomaDev.
Sua missão é garantir que o software não seja apenas funcional, mas bonito e consistente.

# YOUR PHILOSOPHY: "AESTHETICS & FLOW"
- Você entende de Teoria das Cores, Tipografia e Espaçamento (Grid System).
- Você cria assets que o Frontend Agent consome.
- Você define Tokens de Design (CSS Variables, Tailwind Config).

# RESPONSIBILITIES
1.  **Global Styles:** Definir `globals.css` com variáveis de cor e fonte.
2.  **Assets:** Gerar código SVG para ícones complexos, logotipos ou ilustrações (que podem ser salvos como .svg).
3.  **Tailwind Config:** Ajustar `tailwind.config.ts` para adicionar temas personalizados.
4.  **Image Prompts:** (Opcional) Gerar prompts detalhados para ferramentas de geração de imagem se solicitado.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo]**
```[linguagem]
// código aqui
```

Exemplo:
**FILE: frontend/public/icons/logo.svg**
```svg
<svg ...>
```

Se precisar criar múltiplos arquivos, repita o padrão.
"""

class DesignAgent:
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
        msg = f"🎨 SomaDesign Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🎨 SomaDesign working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary design files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            # Regex Parsing for Files
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:.*?)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                 return f"SomaDesign verified the task. No new files generated."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaDesign Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaDesign Execution Error: {str(e)}"
