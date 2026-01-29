"""
WebSocket Manager using Socket.IO for real-time preview updates
"""
import asyncio
from typing import Dict, Set, Optional
from fastapi import FastAPI

# Import socket.io with fallback for missing dependency
try:
    import socketio
    SOCKETIO_AVAILABLE = True
except ImportError:
    SOCKETIO_AVAILABLE = False
    print("⚠️ socket.io not installed. Run: pip install python-socketio[asyncio]")


class WebSocketManager:
    """
    Gerencia conexões WebSocket usando Socket.IO
    """
    
    def __init__(self, app: Optional[FastAPI] = None):
        self.rooms: Dict[str, Set[str]] = {}  # room_id -> set of session_ids
        self.sio = None
        self.socket_app = None
        
        if SOCKETIO_AVAILABLE and app:
            self.sio = socketio.AsyncServer(
                async_mode='asgi',
                cors_allowed_origins='*',
                logger=False,
                engineio_logger=False
            )
            
            # Monta Socket.IO no FastAPI
            self.socket_app = socketio.ASGIApp(
                self.sio,
                other_asgi_app=app
            )
            
            self._register_handlers()
    
    def _register_handlers(self):
        """
        Registra handlers de eventos do Socket.IO
        """
        if not self.sio:
            return
        
        @self.sio.event
        async def connect(sid, environ):
            print(f"✅ Client connected: {sid}")
        
        @self.sio.event
        async def disconnect(sid):
            print(f"❌ Client disconnected: {sid}")
            # Remove de todas as rooms
            for room_id in list(self.rooms.keys()):
                if sid in self.rooms[room_id]:
                    self.rooms[room_id].remove(sid)
                    if not self.rooms[room_id]:
                        del self.rooms[room_id]
        
        @self.sio.event
        async def join_preview(sid, data: dict):
            """
            Cliente entra na room de preview de um projeto
            """
            project_id = data.get('project_id')
            room = f'preview:{project_id}'
            
            await self.sio.enter_room(sid, room)
            
            if room not in self.rooms:
                self.rooms[room] = set()
            self.rooms[room].add(sid)
            
            print(f"👤 {sid} joined {room}")
            
            await self.sio.emit('joined', {'room': room}, room=sid)
        
        @self.sio.event
        async def leave_preview(sid, data: dict):
            """
            Cliente sai da room de preview
            """
            project_id = data.get('project_id')
            room = f'preview:{project_id}'
            
            await self.sio.leave_room(sid, room)
            
            if room in self.rooms and sid in self.rooms[room]:
                self.rooms[room].remove(sid)
                if not self.rooms[room]:
                    del self.rooms[room]
            
            print(f"👋 {sid} left {room}")
    
    async def broadcast_to_room(self, room: str, event: str, data: dict):
        """
        Envia mensagem para todos os clientes em uma room
        """
        if self.sio:
            await self.sio.emit(event, data, room=room)
    
    async def send_to_client(self, sid: str, event: str, data: dict):
        """
        Envia mensagem para um cliente específico
        """
        if self.sio:
            await self.sio.emit(event, data, room=sid)
    
    async def notify_file_change(self, project_id: str, file_path: str, content: str):
        """
        Notifica todos os clientes de um projeto sobre mudança de arquivo
        """
        await self.broadcast_to_room(
            room=f'preview:{project_id}',
            event='file_changed',
            data={
                'path': file_path,
                'content': content
            }
        )
    
    async def notify_build_complete(self, project_id: str):
        """
        Notifica que o build foi completado (força reload)
        """
        await self.broadcast_to_room(
            room=f'preview:{project_id}',
            event='build_complete',
            data={}
        )
    
    async def notify_build_error(self, project_id: str, error: str, stack: str = ""):
        """
        Notifica sobre erro de build
        """
        await self.broadcast_to_room(
            room=f'preview:{project_id}',
            event='build_error',
            data={
                'message': error,
                'stack': stack
            }
        )


# Singleton instance
_ws_manager: Optional[WebSocketManager] = None

def get_ws_manager() -> Optional[WebSocketManager]:
    return _ws_manager

def init_ws_manager(app: FastAPI) -> WebSocketManager:
    global _ws_manager
    _ws_manager = WebSocketManager(app)
    return _ws_manager
