"""
Preview Manager - Simplified version without Docker
Uses subprocess to run dev servers for preview
"""
import os
import asyncio
import subprocess
import secrets
from typing import Dict, Optional
from pathlib import Path
from dataclasses import dataclass
from enum import Enum


class PreviewStatus(Enum):
    STARTING = "starting"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class PreviewInstance:
    project_id: str
    port: int
    process: Optional[subprocess.Popen]
    status: PreviewStatus
    workspace_path: Path
    subdomain: str


class PreviewManager:
    """
    Gerencia previews de projetos (versão simplificada sem Docker)
    Usa subprocess para rodar dev servers
    """
    
    def __init__(self, workspace_base: Path = None):
        self.workspace_base = workspace_base or Path(os.getenv(
            "SOMADEV_WORKSPACE_PATH", 
            "./backend/workspace"
        )).resolve()
        
        self.active_previews: Dict[str, PreviewInstance] = {}
        self.base_port = 3100  # Preview ports start here
        self._next_port = self.base_port
    
    def _get_next_port(self) -> int:
        """Retorna próxima porta disponível"""
        port = self._next_port
        self._next_port += 1
        if self._next_port > 3200:  # Max 100 previews
            self._next_port = self.base_port
        return port
    
    def _detect_stack(self, project_path: Path) -> str:
        """Detecta a stack do projeto"""
        if (project_path / "package.json").exists():
            try:
                import json
                pkg = json.loads((project_path / "package.json").read_text())
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                
                if "next" in deps:
                    return "nextjs"
                elif "vite" in deps:
                    return "vite"
                elif "react-scripts" in deps:
                    return "cra"
                else:
                    return "node"
            except:
                return "node"
        elif (project_path / "requirements.txt").exists():
            return "python"
        else:
            return "static"
    
    def _get_dev_command(self, stack: str, port: int) -> list:
        """Retorna comando de dev server baseado na stack"""
        commands = {
            "nextjs": ["npm", "run", "dev", "--", "-p", str(port)],
            "vite": ["npm", "run", "dev", "--", "--port", str(port), "--host"],
            "cra": ["npm", "start"],  # PORT env var
            "node": ["npm", "run", "dev"],
            "python": ["python", "-m", "http.server", str(port)],
            "static": ["python", "-m", "http.server", str(port)]
        }
        return commands.get(stack, commands["static"])
    
    async def create_preview(self, project_id: str) -> Dict:
        """
        Cria um preview para o projeto
        
        Returns:
            {
                'url': 'http://localhost:3100',
                'status': 'running',
                'port': 3100
            }
        """
        # Check if already running
        if project_id in self.active_previews:
            preview = self.active_previews[project_id]
            if preview.status == PreviewStatus.RUNNING:
                return {
                    'url': f'http://localhost:{preview.port}',
                    'status': 'running',
                    'port': preview.port,
                    'subdomain': preview.subdomain
                }
        
        # Find project path
        project_path = self.workspace_base / project_id
        
        if not project_path.exists():
            # Create workspace if it doesn't exist
            project_path.mkdir(parents=True, exist_ok=True)
            return {
                'url': None,
                'status': 'no_project',
                'message': f'Project directory created at {project_path}'
            }
        
        # Detect stack and get port
        stack = self._detect_stack(project_path)
        port = self._get_next_port()
        subdomain = f"preview-{secrets.token_urlsafe(6)}"
        
        # Get dev command
        cmd = self._get_dev_command(stack, port)
        
        # Set environment
        env = os.environ.copy()
        env["PORT"] = str(port)
        env["NODE_ENV"] = "development"
        
        try:
            # Start dev server process
            process = subprocess.Popen(
                cmd,
                cwd=str(project_path),
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                shell=True
            )
            
            # Create preview instance
            preview = PreviewInstance(
                project_id=project_id,
                port=port,
                process=process,
                status=PreviewStatus.STARTING,
                workspace_path=project_path,
                subdomain=subdomain
            )
            
            self.active_previews[project_id] = preview
            
            # Wait a bit for server to start
            await asyncio.sleep(2)
            
            # Check if process is still running
            if process.poll() is None:
                preview.status = PreviewStatus.RUNNING
                
                return {
                    'url': f'http://localhost:{port}',
                    'status': 'running',
                    'port': port,
                    'subdomain': subdomain,
                    'stack': stack
                }
            else:
                stderr = process.stderr.read().decode() if process.stderr else ""
                preview.status = PreviewStatus.ERROR
                
                return {
                    'url': None,
                    'status': 'error',
                    'error': stderr[:500]
                }
                
        except Exception as e:
            return {
                'url': None,
                'status': 'error',
                'error': str(e)
            }
    
    async def destroy_preview(self, project_id: str) -> Dict:
        """Para e remove um preview"""
        if project_id not in self.active_previews:
            return {'status': 'not_found'}
        
        preview = self.active_previews[project_id]
        
        # Kill process
        if preview.process:
            try:
                preview.process.terminate()
                preview.process.wait(timeout=5)
            except:
                preview.process.kill()
        
        # Remove from active
        del self.active_previews[project_id]
        
        return {'status': 'destroyed'}
    
    async def restart_preview(self, project_id: str) -> Dict:
        """Reinicia um preview"""
        await self.destroy_preview(project_id)
        return await self.create_preview(project_id)
    
    def get_status(self, project_id: str) -> Dict:
        """Retorna status de um preview"""
        if project_id not in self.active_previews:
            return {'status': 'not_running'}
        
        preview = self.active_previews[project_id]
        
        # Check if process is still alive
        if preview.process and preview.process.poll() is not None:
            preview.status = PreviewStatus.STOPPED
        
        return {
            'status': preview.status.value,
            'port': preview.port,
            'url': f'http://localhost:{preview.port}' if preview.status == PreviewStatus.RUNNING else None
        }
    
    def list_previews(self) -> list:
        """Lista todos os previews ativos"""
        return [
            {
                'project_id': pid,
                'port': p.port,
                'status': p.status.value,
                'subdomain': p.subdomain
            }
            for pid, p in self.active_previews.items()
        ]


# Singleton
_preview_manager: Optional[PreviewManager] = None

def get_preview_manager() -> PreviewManager:
    global _preview_manager
    if _preview_manager is None:
        _preview_manager = PreviewManager()
    return _preview_manager
