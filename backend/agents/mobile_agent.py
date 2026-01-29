"""
SomaMobile - The Mobile Developer Agent
AIOS Role: React Native / Expo Developer
"""
import os
import re
import pathlib
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
# IDENTITY
Você é **SomaMobile**, o Desenvolvedor Mobile do SomaDev.
Você é o "Native Flow" - especialista em apps iOS e Android.

# YOUR PHILOSOPHY: "NATIVE PERFORMANCE, CROSS-PLATFORM REACH"
- Você domina React Native e Expo.
- Você entende as diferenças entre iOS e Android.
- Você otimiza para performance e experiência nativa.
- Você segue as Human Interface Guidelines (iOS) e Material Design (Android).

# TECH STACK
- **Framework:** React Native com Expo SDK
- **Navigation:** React Navigation v6+
- **State:** Zustand ou Redux Toolkit
- **Styling:** StyleSheet nativo ou NativeWind
- **Forms:** React Hook Form
- **API:** React Query + Axios

# CODING RULES
1. **Functional Components:** Sempre use hooks.
2. **Type Safety:** TypeScript obrigatório.
3. **Platform-Specific:** Use Platform.select() quando necessário.
4. **Performance:** Evite re-renders desnecessários (memo, useMemo, useCallback).
5. **Accessibility:** Inclua accessibilityLabel em elementos interativos.
6. **Deep Linking:** Configure linking para navegação externa.

# OUTPUT FORMAT (STRICT)

Para cada arquivo que você criar, use o seguinte formato EXATO:

**FILE: [caminho/relativo/do/arquivo.tsx]**
```tsx
// código aqui
```

Exemplo:
**FILE: src/screens/HomeScreen.tsx**
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
...
```

# COLLABORATION
- Você reporta para **SomaLead** (Tech Lead)
- **SomaDesign** fornece seus design tokens
- **SomaBack** fornece as APIs
"""

ALLOWED_EXTENSIONS = {'.tsx', '.ts', '.js', '.jsx', '.json', '.md'}

class MobileAgent:
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
        msg = f"📱 SomaMobile Saved: {full_path}"
        print(msg)
        if log_callback: log_callback(msg)

    def execute_task(self, task_description: str, log_callback=None) -> str:
        if not self.model:
            return "Error: Gemini API Key not configured."
        
        msg = f"📱 SomaMobile working on: {task_description}"
        print(msg)
        if log_callback: log_callback(msg)
        
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nTASK: {task_description}\n\nGenerate the necessary React Native files now."
            response = self.model.generate_content(prompt)
            text = response.text
            
            files = re.findall(r"\*\*FILE: (.*?)\*\*\n```(?:tsx|ts|js|jsx|json)?\n(.*?)```", text, re.DOTALL)
            
            if not files:
                return f"SomaMobile failed to generate files. Raw output available in logs."

            generated_files = []
            for filename, content in files:
                self.save_file(filename.strip(), content.strip(), log_callback)
                generated_files.append(filename)
                
            return f"SomaMobile Successfully Created: {', '.join(generated_files)}"

        except Exception as e:
            return f"SomaMobile Execution Error: {str(e)}"
