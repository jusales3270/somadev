"""
Preview API Routes
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict
from pathlib import Path

router = APIRouter(prefix="/api/preview", tags=["preview"])


class PreviewInitRequest(BaseModel):
    project_id: str


class PreviewInitResponse(BaseModel):
    url: Optional[str]
    status: str
    port: Optional[int] = None
    subdomain: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None


@router.post("/init", response_model=PreviewInitResponse)
async def initialize_preview(
    request: PreviewInitRequest,
    background_tasks: BackgroundTasks
):
    """
    Inicializa ambiente de preview para um projeto
    
    1. Detecta stack do projeto
    2. Inicia dev server
    3. Retorna URL de preview
    """
    from backend.services.preview.preview_manager import get_preview_manager
    from backend.services.preview.file_watcher import get_file_watcher
    
    project_id = request.project_id
    preview_manager = get_preview_manager()
    
    try:
        # Cria preview
        result = await preview_manager.create_preview(project_id)
        
        # Inicia file watcher em background
        file_watcher = get_file_watcher()
        if file_watcher and result.get('url'):
            workspace_path = preview_manager.workspace_base / project_id
            background_tasks.add_task(
                file_watcher.start_watching,
                project_id,
                workspace_path
            )
        
        return PreviewInitResponse(**result)
        
    except Exception as e:
        raise HTTPException(500, f"Failed to initialize preview: {str(e)}")


@router.delete("/{project_id}")
async def destroy_preview(project_id: str):
    """
    Destrói ambiente de preview
    """
    from backend.services.preview.preview_manager import get_preview_manager
    from backend.services.preview.file_watcher import get_file_watcher
    
    try:
        preview_manager = get_preview_manager()
        await preview_manager.destroy_preview(project_id)
        
        file_watcher = get_file_watcher()
        if file_watcher:
            file_watcher.stop_watching(project_id)
        
        return {"status": "destroyed"}
    except Exception as e:
        raise HTTPException(500, f"Failed to destroy preview: {str(e)}")


@router.post("/{project_id}/restart")
async def restart_preview(project_id: str):
    """
    Reinicia preview (útil após mudanças estruturais)
    """
    from backend.services.preview.preview_manager import get_preview_manager
    
    try:
        preview_manager = get_preview_manager()
        result = await preview_manager.restart_preview(project_id)
        return result
    except Exception as e:
        raise HTTPException(500, f"Failed to restart preview: {str(e)}")


@router.get("/{project_id}/status")
async def get_preview_status(project_id: str):
    """
    Retorna status do preview
    """
    from backend.services.preview.preview_manager import get_preview_manager
    
    preview_manager = get_preview_manager()
    return preview_manager.get_status(project_id)


@router.get("/")
async def list_all_previews():
    """
    Lista todos os previews ativos
    """
    from backend.services.preview.preview_manager import get_preview_manager
    
    preview_manager = get_preview_manager()
    return {
        "previews": preview_manager.list_previews(),
        "total": len(preview_manager.active_previews)
    }
