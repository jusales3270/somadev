import os
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(title="SomaDev Orchestrator", version="1.0.0")

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# CORS Setup - Restricted to specific origins
# Add your production domain here when deploying
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],
)

# API Key Authentication
SOMADEV_API_KEY = os.getenv("SOMADEV_API_KEY")

async def verify_api_key(x_api_key: str = Header(None)):
    """Verify API key if SOMADEV_API_KEY is configured."""
    if SOMADEV_API_KEY and x_api_key != SOMADEV_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return x_api_key

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class Task(BaseModel):
    id: int
    title: str
    status: str
    agent: str

# Real Database (Simple List for now)
# Real Database (Simple List for now)
mock_tasks = []

# Initialize Agent
from agents.orchestrator import OrchestratorAgent
from agents.frontend_agent import FrontendAgent
from agents.backend_agent import BackendAgent
from agents.qa_agent import QAAgent
from agents.devops_agent import DevOpsAgent
from agents.design_agent import DesignAgent
# New v2.0 Agents
from agents.architect_agent import ArchitectAgent
from agents.lead_agent import LeadAgent
from agents.mobile_agent import MobileAgent
from agents.data_agent import DataAgent
from agents.security_agent import SecurityAgent
from agents.docs_agent import DocsAgent

orchestrator = OrchestratorAgent()
soma_front = FrontendAgent()
soma_back = BackendAgent()
soma_qa = QAAgent()
soma_ops = DevOpsAgent()
soma_design = DesignAgent()
# New v2.0 Agent Instances
soma_arch = ArchitectAgent()
soma_lead = LeadAgent()
soma_mobile = MobileAgent()
soma_data = DataAgent()
soma_sec = SecurityAgent()
soma_docs = DocsAgent()

@app.get("/")
def read_root():
    return {"status": "SomaDev Orchestrator Running", "agent": "Gemini Orchestrator"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/chat/history")
def get_main_chat_history():
    return orchestrator.get_history()

import traceback

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, api_key: str = Depends(verify_api_key)):
    try:
        # Log truncated message for privacy
        msg_preview = request.message[:50] + "..." if len(request.message) > 50 else request.message
        print(f"Received message: {msg_preview}")
        print(f"Orchestrator model initialized: {orchestrator.model is not None}")
        
        # Process message
        
        # Save to History (Simplistic)
        if "[BRAINSTORM MODE]" in request.message:
            ideation_history.append({"role": "user", "text": request.message.replace("[BRAINSTORM MODE] ", "")})

        result = await orchestrator.process_message(request.message)
        
        # Save AI Response to History
        if "[BRAINSTORM MODE]" in request.message:
             response_text = result.get("text", "") if isinstance(result, dict) else str(result)
             ideation_history.append({"role": "ai", "text": response_text})
        
        # Handle Structured Data (Kanban Updates)
        if isinstance(result, dict):
            response_text = result.get("text", "")
            kanban_data = result.get("kanban_data")
            
            if kanban_data and "kanban_tasks" in kanban_data:
                print(f"♻️ Updating Kanban Board with {len(kanban_data['kanban_tasks'])} tasks.")
                global mock_tasks
                mock_tasks.clear()
                
                # Transform JSON tasks to Internal Task Model
                for i, task in enumerate(kanban_data['kanban_tasks']):
                    new_task = {
                        "id": i + 1,
                        "title": task.get("title", "Untitled"),
                        "status": "To Do", # Default status
                        "agent": task.get("agent", "SomaBot")
                    }
                    mock_tasks.append(new_task)
            
            return {"response": response_text}
            
        return {"response": str(result)}

    except Exception as e:
        print("CRITICAL ERROR IN /chat ENDPOINT:")
        traceback.print_exc()
        # Don't expose internal error details to client in production
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again later.")

# In-Memory Log Store
agent_logs = []
# In-Memory Ideation Store
ideation_history = []

@app.get("/ideation/history")
def get_ideation_history():
    return ideation_history

# ... (inside chat_endpoint)
@app.get("/tasks")
def get_tasks():
    return mock_tasks

def log_event(agent: str, message: str):
    timestamp = time.strftime("%H:%M:%S")
    log_entry = {
        "id": len(agent_logs) + 1,
        "timestamp": timestamp,
        "agent": agent,
        "message": message
    }
    agent_logs.append(log_entry)
    # Keep only last 100 logs
    if len(agent_logs) > 100:
        agent_logs.pop(0)

@app.get("/logs")
def get_logs():
    return agent_logs

from fastapi import FastAPI, HTTPException, BackgroundTasks

# ... (imports remain)

# ... (previous code remains)

def run_agent_task(task_id: int):
    """Runs the agent execution in the background."""
    print(f"🔄 Background Task Started for ID: {task_id}")
    
    # Re-find task (safest in case of race conditions, though mock_tasks is in-memory)
    task = next((t for t in mock_tasks if t["id"] == task_id), None)
    if not task:
        log_event("Orchestrator", f"❌ Task #{task_id} not found in background worker.")
        return

    try:
        # Define Logger Callback
        def agent_logger(msg):
            log_event(task["agent"], msg)

        # Select Agent
        result = "Agent not found"
        if task["agent"] == "SomaFront":
            result = soma_front.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaBack":
            result = soma_back.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaQA":
            result = soma_qa.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaOps":
            result = soma_ops.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaDesign":
            result = soma_design.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        # New v2.0 Agents
        elif task["agent"] == "SomaArch":
            result = soma_arch.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaLead":
            result = soma_lead.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaMobile":
            result = soma_mobile.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaData":
            result = soma_data.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaSec":
            result = soma_sec.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        elif task["agent"] == "SomaDocs":
            result = soma_docs.execute_task(f"{task['title']}: {task.get('description', '')}", log_callback=agent_logger)
        else:
             log_event("Orchestrator", f"⚠️ Agent {task['agent']} not found. Defaulting to Orchestrator/Generic.")
             result = f"Simulation: Task executed by {task['agent']}"
            
        
        # Analyze Result for Errors (especially 429 Quota)
        lower_result = str(result).lower()
        
        # 1. Critical Failure (Quota or Crash)
        if "error" in lower_result and ("429" in lower_result or "quota" in lower_result):
            task["status"] = "To Do"
            log_event("Orchestrator", f"❌ Task #{task_id} Failed (Quota). Reverting to 'To Do'.")
            
        # 2. QA Feedback Loop (Self-Healing)
        elif task["agent"] == "SomaQA" and ("failed" in lower_result or "fail" in lower_result):
            # Mark QA as Done (it did its job: found a bug)
            task["status"] = "Done"
            log_event("SomaQA", f"🚫 TEST FAILED. Initiating Repair Protocol.")
            
            # Identify Culprit (Heuristic)
            culprit_agent = "SomaBack"
            if "component" in task["title"].lower() or "frontend" in task["title"].lower() or "ui" in task["title"].lower():
                culprit_agent = "SomaFront"
                
            # Create Bugfix Task
            new_id = len(mock_tasks) + 1
            bugfix_task = {
                "id": new_id,
                "title": f"BUGFIX: {task['title']}",
                "description": f"URGENT. QA Reported issues: {result[:200]}...",
                "agent": culprit_agent,
                "status": "To Do"
            }
            mock_tasks.append(bugfix_task)
            log_event("Orchestrator", f"🚨 Auto-Created Task #{new_id} for {culprit_agent} to fix found bugs.")
            
        else:
            # Update Status: Done
            task["status"] = "Done"
            log_event("Orchestrator", f"✅ Task #{task_id} Complete. Result: {result is not None}")
        
    except Exception as e:
        task["status"] = "To Do" # Revert on failure
        log_event("Orchestrator", f"❌ Execution Failed: {e}")
        print(f"❌ Background Execution Failed: {e}")

@app.post("/execute/{task_id}")
async def execute_task(task_id: int, background_tasks: BackgroundTasks, api_key: str = Depends(verify_api_key)):
    # Find task
    task = next((t for t in mock_tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update Status: In Progress IMMEDIATELY
    task["status"] = "In Progress"
    log_event("Orchestrator", f"🚀 Queuing Task #{task_id}: {task['title']}")
    
    # Add to background tasks (Non-blocking)
    background_tasks.add_task(run_agent_task, task_id)
    
    return {"status": "queued", "message": "Task started in background"}

# =====================================
# AIOS Rules Endpoint
# =====================================
import pathlib

# Map agent names to their AIOS rule files
AGENT_RULES_MAP = {
    "sara": "pm.md",
    "somaarch": "architect.md",
    "somalead": "dev.md",  # Uses dev.md as base
    "somafront": "dev.md",
    "somaback": "dev.md",
    "somamobile": "dev.md",
    "somadata": "data-engineer.md",
    "somaqA": "qa.md",
    "somaops": "devops.md",
    "somadesign": "ux-design-expert.md",
    "somasec": "devops.md",  # Security uses devops as base
    "somadocs": "pm.md"  # Docs uses PM as base
}

@app.get("/rules/{agent_name}")
def get_agent_rules(agent_name: str):
    """Retrieve AIOS rules for a specific agent."""
    agent_key = agent_name.lower()
    
    if agent_key not in AGENT_RULES_MAP:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")
    
    rule_file = AGENT_RULES_MAP[agent_key]
    rules_path = pathlib.Path(__file__).parent / "core_engine" / ".cursor" / "rules" / "agents" / rule_file
    
    if not rules_path.exists():
        raise HTTPException(status_code=404, detail=f"Rule file not found: {rule_file}")
    
    try:
        with open(rules_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {
            "agent": agent_name,
            "rule_file": rule_file,
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading rules: {str(e)}")

@app.get("/rules")
def list_available_rules():
    """List all available agent rules."""
    return {
        "agents": list(AGENT_RULES_MAP.keys()),
        "total": len(AGENT_RULES_MAP)
    }
