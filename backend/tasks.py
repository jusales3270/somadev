import time
import traceback
from celery import Task
from celery_app import celery_app
from database.models import SessionLocal, TaskRepository, TaskStatus
from database.redis_client import get_redis_client

# Import Agents
# We import them here to ensure they are loaded in the worker process
from agents.orchestrator import OrchestratorAgent
from agents.frontend_agent import FrontendAgent
from agents.backend_agent import BackendAgent
from agents.qa_agent import QAAgent
from agents.devops_agent import DevOpsAgent
from agents.design_agent import DesignAgent
from agents.architect_agent import ArchitectAgent
from agents.lead_agent import LeadAgent
from agents.mobile_agent import MobileAgent
from agents.data_agent import DataAgent
from agents.security_agent import SecurityAgent
from agents.docs_agent import DocsAgent

# Initialize Agents (Singleton-like in the worker process)
agents = {
    "SomaOrchestrator": OrchestratorAgent(),
    "SomaFront": FrontendAgent(),
    "SomaBack": BackendAgent(),
    "SomaQA": QAAgent(),
    "SomaOps": DevOpsAgent(),
    "SomaDesign": DesignAgent(),
    "SomaArch": ArchitectAgent(),
    "SomaLead": LeadAgent(),
    "SomaMobile": MobileAgent(),
    "SomaData": DataAgent(),
    "SomaSec": SecurityAgent(),
    "SomaDocs": DocsAgent(),
}

@celery_app.task(bind=True, name="backend.tasks.run_agent_task")
def run_agent_task(self, task_id: int):
    """
    Executes an agent task asynchronously.
    """
    print(f"🔄 [Worker] Starting Task ID: {task_id}")
    
    db = SessionLocal()
    repo = TaskRepository(db)
    
    try:
        # Get Task
        task = repo.get_task(task_id)
        if not task:
            print(f"❌ [Worker] Task #{task_id} not found.")
            return "Task not found"

        # Update Status to In Progress (if not already)
        repo.update_task_status(task_id, TaskStatus.IN_PROGRESS.value)
        
        # Define Logger Callback
        def agent_logger(msg):
            repo.log_execution(task.agent, msg)
            print(f"📝 [{task.agent}] {msg}")

        # Select Agent
        agent_name = task.agent
        agent_instance = agents.get(agent_name)
        
        if not agent_instance:
             # Fallback for Orchestrator or unknown
             if agent_name == "Orchestrator":
                 agent_instance = agents["SomaOrchestrator"]
             else:
                 repo.log_execution("System", f"⚠️ Agent {agent_name} not found. Using Generic.")
                 agent_instance = agents["SomaOrchestrator"]

        # Execute
        result = agent_instance.execute_task(
            f"{task.title}: {task.description or ''}", 
            log_callback=agent_logger
        )
        
        # Analyze Result
        lower_result = str(result).lower()
        
        # Check for Quota/Critical Errors
        if "error" in lower_result and ("429" in lower_result or "quota" in lower_result):
            repo.update_task_status(task_id, TaskStatus.TODO.value, error="Rate Limit/Quota Exceeded")
            repo.log_execution("System", f"❌ Task #{task_id} Failed (Quota). Re-queued.")
        
        # QA Failure -> Create Bugfix
        elif agent_name == "SomaQA" and ("failed" in lower_result or "fail" in lower_result):
            repo.update_task_status(task_id, TaskStatus.DONE.value, result=str(result))
            repo.log_execution("SomaQA", f"🚫 TEST FAILED. Initiating Repair Protocol.")
            
            # Identify Culprit
            culprit = "SomaBack"
            if any(k in task.title.lower() for k in ["component", "frontend", "ui"]):
                culprit = "SomaFront"
            
            # Create Bugfix Task
            repo.create_task(
                project_id=task.project_id,
                title=f"BUGFIX: {task.title}",
                agent=culprit,
                description=f"URGENT. QA Reported issues: {str(result)[:500]}"
            )
            repo.log_execution("System", f"🚨 Auto-Created Bugfix Task for {culprit}")
            
        else:
            # Success
            repo.update_task_status(task_id, TaskStatus.DONE.value, result=str(result))
            repo.log_execution("System", f"✅ Task #{task_id} Complete.")
            
        return str(result)

    except Exception as e:
        traceback.print_exc()
        repo.log_execution("System", f"❌ Execution Failed: {str(e)}", level="error")
        repo.update_task_status(task_id, TaskStatus.FAILED.value, error=str(e))
        raise e
    finally:
        db.close()
