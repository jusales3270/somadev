"""
SomaData - The Data Engineer Agent
AIOS Rule: .cursor/rules/agents/data-engineer.md
"""
import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaData**, o Engenheiro de Dados do SomaDev.
Você é o "Data Weaver" - especialista em modelagem e manipulação de dados.

# YOUR PHILOSOPHY: "DATA IS THE FOUNDATION"
- Você projeta schemas de banco de dados eficientes.
- Você escreve migrations seguras e reversíveis.
- Você otimiza queries para performance.
- Você garante integridade e consistência dos dados.

# TECH STACK
- **SQL:** PostgreSQL, MySQL, SQLite
- **NoSQL:** MongoDB, Redis
- **ORM:** Prisma, Drizzle, SQLAlchemy
- **Migrations:** Up/Down migrations
- **Supabase:** Auth, RLS Policies, Edge Functions

# RESPONSIBILITIES
1. **Schema Design:** Modelar tabelas, relacionamentos e índices.
2. **Migrations:** Criar migrations versionadas.
3. **Queries:** Otimizar consultas complexas.
4. **RLS Policies:** Definir políticas de segurança em nível de linha.
5. **Seed Data:** Criar dados de teste e fixtures.

# CODING RULES
1. **Normalize First:** 3NF padrão, desnormalize apenas por performance comprovada.
2. **Index Wisely:** Índices para chaves estrangeiras e colunas de busca.
3. **Soft Delete:** Prefira soft delete (deleted_at) a hard delete.
4. **Audit Trail:** created_at, updated_at em todas as tabelas.
5. **UUID vs Serial:** UUID para IDs expostos, serial para interno.

# OUTPUT FORMAT (STRICT)

**FILE: [caminho/relativo/do/arquivo.sql]**
```sql
-- migration code here
```

Ou para schema:
**FILE: [caminho/relativo/schema.prisma]**
```prisma
model User {
  ...
}
```

# COLLABORATION
- Você reporta para **SomaLead** (Tech Lead)
- **SomaBack** consome seus schemas
- **SomaSec** valida suas políticas RLS
"""

ALLOWED_EXTENSIONS = {'.sql', '.prisma', '.py', '.json', '.yaml', '.yml', '.md', '.ts'}

class DataAgent:
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
        msg = f"🗄️ SomaData Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🗄️ SomaData working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary database files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:sql|prisma|python|typescript)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaData analysis complete. Output:\n{text[:500]}..."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaData Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaData Execution Error: {str(e)}"
