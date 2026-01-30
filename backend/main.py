import os
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import traceback

# Database and Middleware
from database import get_db, TaskRepository, init_db
from middleware import RateLimitMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from tasks import run_agent_task # Celery Task

app = FastAPI(title="SomaDev Orchestrator", version="2.0.0")

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

# Observability
Instrumentator().instrument(app).expose(app)

# Rate Limiting Middleware - 60 requests/minute with burst of 10
app.add_middleware(RateLimitMiddleware, requests_per_minute=60, burst_size=10)

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
# mock_tasks removed in favor of DB


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

# Visual Layer v2.5 - Import routes
from api.routes.preview import router as preview_router
from api.routes.deploy import router as deploy_router
from services.preview.file_watcher import init_file_watcher, get_file_watcher
from services.preview.preview_manager import get_preview_manager

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

# Visual Layer v2.5 - Register routers
app.include_router(preview_router)
app.include_router(deploy_router)

# Initialize file watcher
_file_watcher = init_file_watcher()

@app.get("/")
def read_root():
    return {"status": "SomaDev Orchestrator Running", "agent": "Gemini Orchestrator"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/chat/history")
def get_main_chat_history(db = Depends(get_db)):
    repo = TaskRepository(db)
    # Assuming project_id 1 for default/main project
    return repo.get_chat_history(project_id=1)

import traceback

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, api_key: str = Depends(verify_api_key), db = Depends(get_db)):
    try:
        # Log truncated message for privacy
        msg_preview = request.message[:50] + "..." if len(request.message) > 50 else request.message
        print(f"Received message: {msg_preview}")
        print(f"Orchestrator client initialized: {orchestrator.client is not None}")
        
        # Process message
        
        # Save to History (Simplistic)
        if "[BRAINSTORM MODE]" in request.message:
            # ideation_history.append({"role": "user", "text": request.message.replace("[BRAINSTORM MODE] ", "")})
            pass

        result = await orchestrator.process_message(request.message)
        
        # Save to DB
        repo = TaskRepository(db)
        repo.add_chat_message(project_id=1, role="user", content=request.message)
        
        # Save AI Response to History
        response_text = result.get("text", "") if isinstance(result, dict) else str(result)
        repo.add_chat_message(project_id=1, role="assistant", content=response_text)
        
        # Handle Structured Data (Kanban Updates)
        if isinstance(result, dict):
            response_text = result.get("text", "")
            kanban_data = result.get("kanban_data")
            
            if kanban_data and "kanban_tasks" in kanban_data:
                print(f"♻️ Updating Kanban Board with {len(kanban_data['kanban_tasks'])} tasks.")
                
                # Create tasks in DB
                for task in kanban_data['kanban_tasks']:
                    repo.create_task(
                        project_id=1,
                        title=task.get("title", "Untitled"),
                        agent=task.get("agent", "SomaBot"),
                        description=task.get("description", "")
                    )
            
            return {"response": response_text}
            
        return {"response": str(result)}

    except Exception as e:
        print("CRITICAL ERROR IN /chat ENDPOINT:")
        traceback.print_exc()
        # Don't expose internal error details to client in production
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again later.")

@app.get("/ideation/history")
def get_ideation_history():
    # Deprecated or move to DB if needed
    return []

# ... (inside chat_endpoint)
@app.get("/tasks")
def get_tasks(db = Depends(get_db)):
    repo = TaskRepository(db)
    return repo.get_tasks(project_id=1)

@app.get("/logs")
def get_logs(db = Depends(get_db)):
    repo = TaskRepository(db)
    return repo.get_logs()

from fastapi import FastAPI, HTTPException, BackgroundTasks

# ... (imports remain)

# ... (previous code remains)

# run_agent_task moved to tasks.py for Celery execution

@app.post("/execute/{task_id}")
async def execute_task(task_id: int, api_key: str = Depends(verify_api_key), db = Depends(get_db)):
    repo = TaskRepository(db)
    task = repo.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update Status
    repo.update_task_status(task_id, "Queued")
    
    # Trigger Celery Task
    run_agent_task.delay(task_id)
    
    return {"status": "queued", "message": "Task queued for execution (Celery)"}

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


# ============== NEW CRUD ENDPOINTS ==============

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class TaskReorder(BaseModel):
    status: str
    order_index: int

@app.patch("/tasks/{task_id}")
async def update_task(task_id: int, update: TaskUpdate, api_key: str = Depends(verify_api_key), db = Depends(get_db)):
    """Update task title and/or description."""
    repo = TaskRepository(db)
    task = repo.update_task(task_id, title=update.title, description=update.description)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/tasks/{task_id}/reorder")
async def reorder_task(task_id: int, reorder: TaskReorder, api_key: str = Depends(verify_api_key), db = Depends(get_db)):
    """Handle drag & drop reordering - update status and order."""
    repo = TaskRepository(db)
    
    # Map status names
    status_map = {
        "todo": "To Do",
        "in_progress": "In Progress", 
        "done": "Done",
        "failed": "Failed"
    }
    new_status = status_map.get(reorder.status, reorder.status)
    
    task = repo.reorder_task(task_id, new_status, reorder.order_index)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int, api_key: str = Depends(verify_api_key), db = Depends(get_db)):
    """Delete a task."""
    repo = TaskRepository(db)
    success = repo.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": f"Task {task_id} deleted"}

@app.get("/queue/status")
async def get_queue_status():
    """Get current task queue status."""
    # TODO: Implement Redis Queue Status check if needed
    return {"status": "active", "backend": "Celery+Redis"}

@app.post("/queue/cancel/{task_id}")
async def cancel_queued_task(task_id: int, api_key: str = Depends(verify_api_key)):
    # Celery cancellation implementation required
    return {"message": "Not implemented yet for Celery"}

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "agents_loaded": 12,
        "timestamp": datetime.now().isoformat()
    }
