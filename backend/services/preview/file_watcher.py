"""
File Watcher Service - Observa mudanças em arquivos e notifica via WebSocket
"""
import asyncio
import time
from pathlib import Path
from typing import Callable, Set, Dict, Optional
from threading import Thread

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    print("⚠️ watchdog not installed. Run: pip install watchdog")


class ProjectFileHandler(FileSystemEventHandler):
    """
    Handler para eventos de filesystem
    """
    
    def __init__(
        self, 
        project_path: Path, 
        on_change: Callable[[str, str], None],
        debounce_ms: int = 500
    ):
        self.project_path = project_path
        self.on_change = on_change
        self.debounce_ms = debounce_ms
        
        # Debouncing
        self.last_change_time: Dict[str, float] = {}
        
        # Ignore patterns
        self.ignore_patterns = {
            'node_modules', '.git', '.next', 'dist', 
            'build', '__pycache__', '.venv', '.cache'
        }
        
        # Allowed extensions for hot reload
        self.allowed_extensions = {
            '.tsx', '.ts', '.jsx', '.js', 
            '.css', '.scss', '.sass', '.less',
            '.py', '.html', '.json', '.md'
        }
    
    def _should_ignore(self, path: Path) -> bool:
        """Verifica se o arquivo deve ser ignorado"""
        # Check ignore patterns
        if any(pattern in path.parts for pattern in self.ignore_patterns):
            return True
        
        # Check extension
        if path.suffix.lower() not in self.allowed_extensions:
            return True
        
        return False
    
    def _debounce_check(self, path: str) -> bool:
        """Verifica debounce para evitar múltiplos triggers"""
        now = time.time()
        
        if path in self.last_change_time:
            elapsed = (now - self.last_change_time[path]) * 1000
            if elapsed < self.debounce_ms:
                return False
        
        self.last_change_time[path] = now
        return True
    
    def on_modified(self, event):
        if event.is_directory:
            return
        self._handle_change(event.src_path)
    
    def on_created(self, event):
        if event.is_directory:
            return
        self._handle_change(event.src_path)
    
    def _handle_change(self, src_path: str):
        """Processa mudança de arquivo"""
        file_path = Path(src_path)
        
        # Check if should ignore
        if self._should_ignore(file_path):
            return
        
        relative_path = str(file_path.relative_to(self.project_path))
        
        # Debounce check
        if not self._debounce_check(relative_path):
            return
        
        # Read file content
        try:
            content = file_path.read_text(encoding='utf-8')
            
            # Call change handler
            print(f"🔥 File changed: {relative_path}")
            self.on_change(relative_path, content)
            
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")


class FileWatcherService:
    """
    Gerencia múltiplos watchers (um por projeto)
    """
    
    def __init__(self, ws_manager=None):
        self.observers: Dict[str, Observer] = {}
        self.ws_manager = ws_manager
        self._loop = None
    
    def set_event_loop(self, loop):
        """Define o event loop para operações async"""
        self._loop = loop
    
    def start_watching(self, project_id: str, project_path: Path):
        """
        Inicia observação de arquivos para um projeto
        """
        if not WATCHDOG_AVAILABLE:
            print("⚠️ Watchdog not available, file watching disabled")
            return
        
        if project_id in self.observers:
            return  # Já está observando
        
        def on_file_changed(relative_path: str, content: str):
            # Envia via WebSocket para o frontend
            if self.ws_manager and self._loop:
                asyncio.run_coroutine_threadsafe(
                    self.ws_manager.notify_file_change(
                        project_id=project_id,
                        file_path=relative_path,
                        content=content
                    ),
                    self._loop
                )
        
        handler = ProjectFileHandler(project_path, on_file_changed)
        observer = Observer()
        observer.schedule(handler, str(project_path), recursive=True)
        observer.start()
        
        self.observers[project_id] = observer
        print(f"👀 Watching files for project: {project_id} at {project_path}")
    
    def stop_watching(self, project_id: str):
        """
        Para observação de um projeto
        """
        if project_id in self.observers:
            self.observers[project_id].stop()
            self.observers[project_id].join()
            del self.observers[project_id]
            print(f"🛑 Stopped watching project: {project_id}")
    
    def stop_all(self):
        """Para todos os watchers"""
        for project_id in list(self.observers.keys()):
            self.stop_watching(project_id)


# Singleton instance
_file_watcher: Optional[FileWatcherService] = None

def get_file_watcher() -> Optional[FileWatcherService]:
    return _file_watcher

def init_file_watcher(ws_manager=None) -> FileWatcherService:
    global _file_watcher
    _file_watcher = FileWatcherService(ws_manager)
    return _file_watcher
