"""
Deploy Service - Vercel Integration
"""
import os
import base64
import asyncio
from typing import Dict, Optional, List
from pathlib import Path
from dataclasses import dataclass

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False
    print("⚠️ httpx not installed. Run: pip install httpx")


@dataclass
class DeployResult:
    url: str
    deployment_id: str
    status: str
    logs_url: str


class VercelDeployer:
    """
    Integração com Vercel API para deploy automático
    """
    
    def __init__(self, api_token: str = None):
        self.api_token = api_token or os.getenv("VERCEL_TOKEN", "")
        self.base_url = "https://api.vercel.com"
        
        if not self.api_token:
            print("⚠️ VERCEL_TOKEN not set. Deploy to Vercel will not work.")
    
    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    async def deploy(
        self, 
        project_id: str,
        workspace_path: Path,
        env_vars: Optional[Dict[str, str]] = None
    ) -> DeployResult:
        """
        Faz deploy do projeto para Vercel
        """
        if not HTTPX_AVAILABLE:
            raise Exception("httpx not installed")
        
        if not self.api_token:
            raise Exception("VERCEL_TOKEN not configured")
        
        async with httpx.AsyncClient(timeout=300.0) as client:
            # 1. Ensure project exists
            await self._ensure_project_exists(client, project_id)
            
            # 2. Prepare files
            files = self._prepare_files(workspace_path)
            
            # 3. Create deployment
            deployment = await self._create_deployment(
                client, project_id, files, env_vars or {}
            )
            
            # 4. Wait for deployment
            final_status = await self._wait_for_deployment(
                client, deployment['id']
            )
            
            return DeployResult(
                url=f"https://{deployment.get('url', deployment['id'])}.vercel.app",
                deployment_id=deployment['id'],
                status=final_status,
                logs_url=f"https://vercel.com/{project_id}/{deployment['id']}"
            )
    
    async def _ensure_project_exists(self, client: httpx.AsyncClient, project_id: str):
        """Garante que projeto existe no Vercel"""
        response = await client.get(
            f"{self.base_url}/v9/projects/{project_id}",
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json()
        
        # Create new project
        response = await client.post(
            f"{self.base_url}/v9/projects",
            headers=self.headers,
            json={
                "name": project_id,
                "framework": "nextjs"
            }
        )
        
        if response.status_code not in (200, 201):
            raise Exception(f"Failed to create Vercel project: {response.text}")
        
        return response.json()
    
    def _prepare_files(self, workspace_path: Path) -> List[Dict]:
        """Prepara arquivos para upload"""
        files = []
        
        ignore_patterns = {'node_modules', '.git', '.next', 'dist', '__pycache__'}
        
        for file_path in workspace_path.rglob('*'):
            if file_path.is_file():
                if any(pattern in file_path.parts for pattern in ignore_patterns):
                    continue
                
                relative_path = file_path.relative_to(workspace_path)
                
                try:
                    content = file_path.read_bytes()
                    encoded = base64.b64encode(content).decode()
                    
                    files.append({
                        "file": str(relative_path),
                        "data": encoded
                    })
                except Exception as e:
                    print(f"⚠️ Could not read {file_path}: {e}")
        
        return files
    
    async def _create_deployment(
        self,
        client: httpx.AsyncClient,
        project_id: str,
        files: List[Dict],
        env_vars: Dict[str, str]
    ) -> Dict:
        """Cria um novo deployment"""
        payload = {
            "name": project_id,
            "files": files,
            "target": "production",
            "projectSettings": {
                "framework": "nextjs"
            }
        }
        
        if env_vars:
            payload["env"] = [
                {"key": k, "value": v}
                for k, v in env_vars.items()
            ]
        
        response = await client.post(
            f"{self.base_url}/v13/deployments",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code not in (200, 201):
            raise Exception(f"Deployment failed: {response.text}")
        
        return response.json()
    
    async def _wait_for_deployment(
        self,
        client: httpx.AsyncClient,
        deployment_id: str,
        timeout: int = 600
    ) -> str:
        """Aguarda deployment ficar pronto"""
        for _ in range(timeout // 5):
            response = await client.get(
                f"{self.base_url}/v13/deployments/{deployment_id}",
                headers=self.headers
            )
            
            data = response.json()
            status = data.get('readyState', data.get('state'))
            
            if status == 'READY':
                return 'ready'
            elif status == 'ERROR':
                raise Exception(f"Deployment failed: {data.get('error')}")
            elif status == 'CANCELED':
                raise Exception("Deployment was canceled")
            
            await asyncio.sleep(5)
        
        raise TimeoutError(f"Deployment {deployment_id} timed out")


# Singleton
_vercel_deployer: Optional[VercelDeployer] = None

def get_vercel_deployer() -> VercelDeployer:
    global _vercel_deployer
    if _vercel_deployer is None:
        _vercel_deployer = VercelDeployer()
    return _vercel_deployer
