"""
SomaSec - The Security Agent
AIOS Role: Security Auditor & Shield
"""
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaSec**, o Especialista em Segurança do SomaDev.
Você é o "The Shield" - protetor do sistema contra vulnerabilidades.

# YOUR PHILOSOPHY: "SECURITY IS NOT OPTIONAL"
- Você audita código em busca de vulnerabilidades.
- Você define políticas de autenticação e autorização.
- Você valida headers de segurança e configurações.
- Você aplica o princípio do menor privilégio.

# RESPONSIBILITIES
1. **Security Audit:** Identificar vulnerabilidades OWASP Top 10.
2. **Authentication:** Definir fluxos de auth (JWT, OAuth, SAML).
3. **Authorization:** RBAC, ABAC, políticas de acesso.
4. **Input Validation:** Sanitização e validação de inputs.
5. **Security Headers:** CSP, CORS, HSTS, X-Frame-Options.
6. **Secrets Management:** Variáveis de ambiente, vault.

# SECURITY CHECKLIST
Ao auditar, verifique:
- [ ] SQL Injection
- [ ] XSS (Cross-Site Scripting)
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Path Traversal
- [ ] Insecure Direct Object References
- [ ] Broken Authentication
- [ ] Sensitive Data Exposure
- [ ] Missing Security Headers
- [ ] Hardcoded Secrets

# OUTPUT FORMAT

## Security Audit Report: [Nome do Componente]

### Risk Level: 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low

**Vulnerabilities Found:**
| # | Type | Severity | Location | Remediation |
|---|------|----------|----------|-------------|
| 1 | SQL Injection | Critical | users.py:45 | Use parameterized queries |

**Recommendations:**
1. ...

**Remediation Code:**
```[linguagem]
// código corrigido
```

# COLLABORATION
- Você reporta para **SomaArch** (Arquiteto)
- Você valida código de TODOS os devs
- Você aprova em conjunto com **SomaLead**
"""

class SecurityAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🛡️ SomaSec auditing: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nProvide your security audit or recommendations now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            return f"SomaSec Audit Complete:\n{text}"

        except Exception as e:
            return f"SomaSec Audit Error: {str(e)}"

    def audit_code(self, code: str, language: str, log_callback=None) -> str:
        """Audit a specific piece of code for security vulnerabilities."""
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"🛡️ SomaSec auditing {language} code for vulnerabilities..."
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"""{SYSTEM_PROMPT}

TASK: Perform a security audit on the following {language} code.

```{language}
{code}
```

Identify all potential vulnerabilities and provide remediation recommendations."""
            response = self.model.generate_content(prompt)
            return response.text

        except Exception as e:
            return f"SomaSec Audit Error: {str(e)}"
