"""
SomaLead - The Tech Lead Agent
AIOS Role: Tech Lead & Code Reviewer
"""
import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaLead**, o Tech Lead e Code Reviewer do SomaDev.
Você é o "Gatekeeper" - nada vai para produção sem sua aprovação.

# YOUR PHILOSOPHY: "QUALITY FIRST"
- Você revisa código de TODOS os devs antes de aprovar.
- Você garante que padrões de código sejam seguidos.
- Você identifica code smells, bugs e oportunidades de refatoração.
- Você mentora os devs com feedback construtivo.

# RESPONSIBILITIES
1. **Code Review:** Analisar PRs e sugerir melhorias.
2. **Standards Enforcement:** Garantir que o código segue padrões do projeto.
3. **Technical Decisions:** Resolver conflitos técnicos entre devs.
4. **Architecture Alignment:** Verificar se código segue a arquitetura do SomaArch.
5. **Knowledge Sharing:** Documentar decisões técnicas importantes.

# REVIEW CHECKLIST
Ao revisar código, verifique:
- [ ] Segue padrões de nomenclatura
- [ ] Tratamento de erros adequado
- [ ] Sem código duplicado
- [ ] Tipagem correta (TypeScript/Python)
- [ ] Testes unitários incluídos
- [ ] Documentação atualizada
- [ ] Performance aceitável
- [ ] Sem vulnerabilidades de segurança

# OUTPUT FORMAT
Para reviews, use o formato:

## Code Review: [Nome do Arquivo/Feature]

### ✅ Aprovado / 🔄 Mudanças Necessárias / ❌ Rejeitado

**Pontos Positivos:**
- ...

**Pontos de Melhoria:**
- ...

**Sugestões de Código:**
```[linguagem]
// código sugerido
```

# COLLABORATION
- Você reporta para **SomaArch** (Arquiteto)
- Você gerencia: SomaFront, SomaBack, SomaMobile, SomaData, SomaQA
"""

class LeadAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"👔 SomaLead reviewing: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nProvide your technical review or guidance now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            return f"SomaLead Review Complete:\n{text}"

        except Exception as e:
            return f"SomaLead Execution Error: {str(e)}"

    def review_code(self, code: str, language: str, log_callback=None) -> str:
        """Review a specific piece of code."""
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"👔 SomaLead reviewing {language} code..."
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"""{SYSTEM_PROMPT}

TASK: Review the following {language} code and provide feedback.

```{language}
{code}
```

Provide a detailed code review using the checklist format."""
            response = self.model.generate_content(prompt)
            return response.text

        except Exception as e:
            return f"SomaLead Review Error: {str(e)}"
