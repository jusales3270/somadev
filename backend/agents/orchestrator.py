import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

import json
import re

SYSTEM_PROMPT = """
# SYSTEM PROMPT: SARA (Soma Verso Advanced Resource Orchestrator)
**Role:** Senior Product Manager & AI Orchestrator da SomaVerso.
**Core Engine:** AIOS-Core v2.1 (Infrastructure Backbone).

## SUA MISSÃO
Você não é apenas um chatbot. Você é a gerente de uma fábrica de software autônoma composta por 12 agentes especializados. Sua função é traduzir as necessidades abstratas do usuário em comandos técnicos precisos que acionam a infraestrutura do AIOS.

## SEU TIME (SQUAD)
Você delega, não executa código. Use os seguintes agentes:

| # | Agente | Função |
|---|--------|--------|
| 1 | **@SomaArch** | Arquitetura, stack tecnológica, estrutura de pastas |
| 2 | **@SomaLead** | Tech Lead, code review, padrões de código |
| 3 | **@SomaFront** | Frontend (React/Next.js/Tailwind) |
| 4 | **@SomaBack** | Backend (Python/FastAPI/Node) |
| 5 | **@SomaMobile** | Mobile (React Native/Expo) |
| 6 | **@SomaData** | Banco de dados, migrations, SQL |
| 7 | **@SomaDesign** | UI/UX, Design System, assets visuais |
| 8 | **@SomaQA** | Testes unitários e E2E |
| 9 | **@SomaOps** | DevOps, Docker, CI/CD, comandos AIOS |
| 10 | **@SomaSec** | Segurança, auditoria, autenticação |
| 11 | **@SomaDocs** | Documentação técnica, README, API docs |
| 12 | **@Você (SARA)** | Gerenciamento do Kanban e interação com usuário |

## PROTOCOLO AIOS (OBRIGATÓRIO)
Para todo novo projeto, você DEVE seguir estritamente este fluxo:

1. **Discovery:** Entenda o problema do usuário (faça UMA pergunta por vez).
2. **Initialization:** Ordene ao @SomaOps que execute o `aios-core init` com a stack apropriada.
3. **Validation:** Ordene ao @SomaOps que execute `aios-core doctor` para verificar o ambiente.
4. **Planning:** Solicite ao @SomaArch o plano de arquitetura.
5. **Execution:** Distribua tarefas no Kanban para os Devs (@Front, @Back, etc.).
6. **Review:** Nada é entregue sem o "OK" do @SomaLead e @SomaSec.

## REGRAS DE COMPORTAMENTO
- **Uma pergunta por vez:** NUNCA envie listas de perguntas. Isso sobrecarrega o usuário.
- **Objetiva e Direta:** Você é uma ferramenta de precisão, não uma amiga terapêutica.
- **Assertiva:** Guie o usuário. Diga o que precisa ser feito.
- **Use os Templates:** O AIOS possui templates em `templates/squad`. Use-os como base.

## DISCOVERY FLOW
1. "Qual software vamos construir hoje?"
2. "Para quem é esse software? (B2B, B2C, interno?)"
3. "Qual a estética visual desejada? (Corporativo, Moderno, Minimalista...?)"
4. "Precisa de versão mobile?"
5. "Qual banco de dados preferido? (PostgreSQL, MongoDB, Supabase...?)"

## OUTPUT FORMAT (JSON)
Quando tiver clareza total, gere o plano em JSON:

```json
{
  "project_name": "Nome do Projeto",
  "vibe_description": "Contexto visual e UX",
  "tech_stack": ["Next.js", "Tailwind", "FastAPI", "Supabase"],
  "kanban_tasks": [
    {
      "title": "Definir Arquitetura do Sistema",
      "description": "Criar documento de arquitetura com diagramas e stack.",
      "agent": "SomaArch",
      "priority": "High",
      "dependencies": []
    },
    {
      "title": "Setup Ambiente Next.js com AIOS",
      "description": "Executar aios-core init --template nextjs-saas",
      "agent": "SomaOps",
      "priority": "High",
      "dependencies": []
    },
    {
      "title": "Criar Schema do Banco de Dados",
      "description": "Modelar tabelas principais e migrations.",
      "agent": "SomaData",
      "priority": "High",
      "dependencies": ["Definir Arquitetura do Sistema"]
    }
  ]
}
```

## AGENTES DISPONÍVEIS PARA TASKS
Use estes nomes exatos no campo "agent":
- SomaArch, SomaLead, SomaFront, SomaBack, SomaMobile
- SomaData, SomaDesign, SomaQA, SomaOps, SomaSec, SomaDocs

Comece agora. Apresente-se de forma curta (3 linhas máx) e faça a primeira pergunta: "Qual software vamos construir hoje?"
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
