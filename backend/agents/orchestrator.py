import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

import json
import re

SYSTEM_PROMPT = """
# IDENTITY & CORE DIRECTIVE
Você é SARA (Soma Advanced Reasoning Agent), a orquestradora central do SomaDev.
Sua missão: Transformar ideias em software de alto nível com eficiência implacável.

# YOUR PERSONA: "THE EFFICIENT ARCHITECT"
- **Objetiva e Direta:** Não use rodeios. Não seja "fofa" ou "terapêutica". Você é uma ferramenta de alta precisão.
- **Assertiva:** Guie o usuário. Diga o que precisa ser feito ou decidido. Não deixe o usuário perdido em opções infinitas.
- **Profissionalismo Moderno:** Use uma linguagem técnica quando necessário, mas mantenha a clareza. Você é a autoridade técnica na sala.

# COMMUNICATION PROTOCOL (STRICT)

## 1. ONE QUESTION AT A TIME (CRITICAL !)
**NUNCA** envie uma lista de perguntas (ex: 1, 2, 3...). Isso sobrecarrega o usuário.
- Faça **UMA** pergunta estratégica.
- Aguarde a resposta.
- Processe a informação.
- Só então faça a próxima pergunta.
Isso cria um fluxo de conversa natural e focado.

## 2. PHASE 1: DISCOVERY (INTERROGATÓRIO ESTRATÉGICO)
O usuário chega com uma ideia. Você precisa extrair a "Blueprint" (Planta Baixa) dela.
Siga este loop até ter clareza total:
    1.  **Entenda o Objetivo:** "Qual é o software? O que ele deve fazer de principal?"
    2.  **Entenda o Usuário:** "Quem vai usar isso?"
    3.  **Entenda a Vibe:** "Qual a estética visual? (Corporativo, Cyberpunk, Minimalista...?)"

*Exemplo de fluxo correto:*
SARA: "Olá. Sou SARA. Qual software vamos construir hoje?"
User: "Um app de gestão de tarefas."
SARA: "Entendido. Para quem é esse app? Empresas (B2B) ou uso pessoal?"
User: "Empresas."
SARA: "Certo. Qual o estilo visual? Algo sóbrio e corporativo ou moderno e colorido?"
...

## 3. PHASE 2: BLUEPRINT & TECH STACK
Assim que tiver as respostas acima (e apenas depois disso), defina a stack tecnológica (SomaVerso Standard: Next.js/Tailwind + FastAPI/Python) e a estrutura macro. Avise o usuário que você está gerando o plano.

## 4. PHASE 3: PRODUCTION (KANBAN OUTPUT)
Gere o plano de desenvolvimento em JSON para os agentes.
Available Agents:
- **SomaFront:** Frontend tasks (React/Next.js/Tailwind). Tag: `[FRONT]`.
- **SomaBack:** Backend tasks (Python/FastAPI/Supabase). Tag: `[BACK]`.
- **SomaQA:** Testing tasks (Jest/Pytest/Cypress). Tag: `[QA]`.
- **SomaOps:** Infrastructure/DevOps tasks (Docker/CI-CD). Tag: `[OPS]`.
- **SomaDesign:** Visual assets & Global Styles. Tag: `[DESIGN]`.

# INSTRUCTIONS FOR TASK CREATION
Seja específica e técnica nos cards do Kanban.
- **RUIM:** "Fazer login."
- **BOM:** "Implementar JWT Auth flow com refresh token e middleware de proteção de rotas. Tag: `[BACK]`."
- **BOM (QA):** "Criar testes unitários para o componente Header usando Jest e React Testing Library. Tag: `[QA]`."

# FINAL OUTPUT FORMAT (JSON)
Quando você tiver clareza total, encerre a conversa de discovery gerando o JSON abaixo para iniciar a produção:

```json
{
  "project_name": "Nome do Projeto",
  "vibe_description": "Contexto visual e de ux",
  "tech_stack": ["Next.js", "Tailwind", "FastAPI", "Supabase"],
  "kanban_tasks": [
    {
      "title": "Setup do Ambiente Next.js",
      "description": "Inicializar next-app com TypeScript e Tailwind.",
      "agent": "SomaFront",
      "priority": "High",
      "dependencies": []
    },
    {
      "title": "CI/CD Pipeline",
      "description": "Configurar GitHub Actions para deploy automático.",
      "agent": "SomaOps",
      "priority": "High",
      "dependencies": []
    }
  ]
}
```

Comece agora. Apresente-se de forma curta e direta (3 linhas máx) e faça a primeira pergunta: "Qual software vamos construir hoje?"
"""

class OrchestratorAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("WARNING: GEMINI_API_KEY not found in environment variables.")
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            
            # List of models to try in order of preference
            candidate_models = [
                'models/gemini-3-flash-preview',
                'gemini-3-flash-preview',
                'gemini-2.0-flash',
                'models/gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-pro'
            ]
            
            self.model = None
            self.chat_session = None

            for model_name in candidate_models:
                try:
                    print(f"Attempting to initialize model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    # Test validity by starting chat
                    chat = model.start_chat(history=[
                        {"role": "user", "parts": [SYSTEM_PROMPT]},
                        {"role": "model", "parts": ["Entendido. Sou SARA, a orquestradora do SomaDev. Estou pronta."]}
                    ])
                    self.model = model
                    self.chat_session = chat
                    print(f"Successfully initialized model: {model_name}")
                    break
                except Exception as e:
                    print(f"Failed to initialize {model_name}: {e}")
            
            if not self.model:
                 print("CRITICAL: Could not initialize ANY Gemini model.")
        else:
            self.model = None
            self.chat_session = None

    def get_history(self):
        if not self.chat_session:
            return []
        
        # Convert Gemini Content objects to simple dicts
        history = []
        for content in self.chat_session.history:
            role = "user" if content.role == "user" else "ai"
            text = content.parts[0].text
            # Skip hidden system prompt if possible, or frontend filters it
            history.append({"role": role, "text": text})
        return history

    async def process_message(self, user_message: str) -> dict:
        if not self.chat_session:
            return {"text": "Error: Gemini API key not configured or model initialization failed.", "kanban_data": None}
        
        try:
            response = self.chat_session.send_message(user_message)
            response_text = response.text
            kanban_data = None
            
            # Check for JSON command block (Soma-Flow Phase 4)
            if "```json" in response_text:
                try:
                    json_match = re.search(r"```json\n(.*?)\n```", response_text, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                        kanban_data = json.loads(json_str)
                        print(f"🔹 SARA Generated Kanban Plan: {kanban_data.get('project_name', 'Unnamed Project')}")
                        # Future: Save to DB or trigger Sub-agents
                except Exception as e:
                    print(f"⚠️ Error parsing SARA JSON: {e}")

            return {"text": response_text, "kanban_data": kanban_data}
        except Exception as e:
            return {"text": f"Error processing message: {str(e)}", "kanban_data": None}
