"""
Deploy API Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from pathlib import Path

router = APIRouter(prefix="/api/deploy", tags=["deploy"])


class DeployRequest(BaseModel):
    project_id: str
    provider: str = "vercel"
    env_vars: Optional[Dict[str, str]] = None


class DeployResponse(BaseModel):
    url: str
    deployment_id: str
    status: str
    logs_url: str


@router.post("/", response_model=DeployResponse)
async def deploy_project(request: DeployRequest):
    """
    Faz deploy do projeto para produção
    
    Providers suportados:
    - vercel (padrão)
    """
    from backend.services.preview.preview_manager import get_preview_manager
    from backend.services.deploy.vercel_deployer import get_vercel_deployer
    
    project_id = request.project_id
    preview_manager = get_preview_manager()
    workspace_path = preview_manager.workspace_base / project_id
    
    if not workspace_path.exists():
        raise HTTPException(404, f"Project {project_id} not found")
    
    try:
        if request.provider == "vercel":
            deployer = get_vercel_deployer()
            result = await deployer.deploy(
                project_id=project_id,
                workspace_path=workspace_path,
                env_vars=request.env_vars
            )
            
            return DeployResponse(
                url=result.url,
                deployment_id=result.deployment_id,
                status=result.status,
                logs_url=result.logs_url
            )
        else:
            raise HTTPException(400, f"Provider {request.provider} not supported yet")
        
    except Exception as e:
        raise HTTPException(500, f"Deployment failed: {str(e)}")


@router.get("/{project_id}/status")
async def get_deployment_status(project_id: str):
    """
    Retorna status do último deployment
    """
    # TODO: Implementar consulta ao Vercel
    return {"status": "not_implemented"}
