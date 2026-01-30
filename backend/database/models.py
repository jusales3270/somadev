"""
Database models and persistence layer for SomaDev
Uses SQLite with SQLAlchemy for task and project persistence
"""
import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from enum import Enum

# Database setup
# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./somadev.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    FAILED = "failed"


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tech_stack = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    chat_history = relationship("ChatMessage", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default=TaskStatus.TODO.value)
    agent = Column(String(50), nullable=False)
    priority = Column(Integer, default=0)
    order_index = Column(Integer, default=0)  # For drag & drop ordering
    result = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    generated_files = relationship("GeneratedFile", back_populates="task", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="chat_history")


class GeneratedFile(Base):
    __tablename__ = "generated_files"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", back_populates="generated_files")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    agent = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String(20), default="info")  # info, warning, error
    timestamp = Column(DateTime, default=datetime.utcnow)


# Database initialization
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized")


def get_db():
    """Dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CRUD Operations
class TaskRepository:
    def __init__(self, db):
        self.db = db
    
    def create_project(self, name: str, description: str = None) -> Project:
        project = Project(name=name, description=description)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def get_project(self, project_id: int) -> Project:
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_or_create_default_project(self) -> Project:
        project = self.db.query(Project).first()
        if not project:
            project = self.create_project("Default Project", "Auto-created project")
        return project
    
    def create_task(self, project_id: int, title: str, agent: str, description: str = None) -> Task:
        # Get max order_index for this project
        max_order = self.db.query(Task).filter(Task.project_id == project_id).count()
        
        task = Task(
            project_id=project_id,
            title=title,
            agent=agent,
            description=description,
            order_index=max_order
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def get_tasks(self, project_id: int = None):
        query = self.db.query(Task)
        if project_id:
            query = query.filter(Task.project_id == project_id)
        return query.order_by(Task.order_index).all()
    
    def get_task(self, task_id: int) -> Task:
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def update_task_status(self, task_id: int, status: str, result: str = None, error: str = None) -> Task:
        task = self.get_task(task_id)
        if task:
            task.status = status
            task.updated_at = datetime.utcnow()
            if status == TaskStatus.IN_PROGRESS.value:
                task.started_at = datetime.utcnow()
            elif status in [TaskStatus.DONE.value, TaskStatus.FAILED.value]:
                task.completed_at = datetime.utcnow()
            if result:
                task.result = result
            if error:
                task.error = error
            self.db.commit()
            self.db.refresh(task)
        return task
    
    def update_task(self, task_id: int, title: str = None, description: str = None) -> Task:
        task = self.get_task(task_id)
        if task:
            if title:
                task.title = title
            if description:
                task.description = description
            task.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(task)
        return task
    
    def reorder_task(self, task_id: int, new_status: str, new_index: int) -> Task:
        """Handle drag & drop reordering"""
        task = self.get_task(task_id)
        if task:
            # Update status
            task.status = new_status
            task.order_index = new_index
            task.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(task)
        return task
    
    def delete_task(self, task_id: int) -> bool:
        task = self.get_task(task_id)
        if task:
            self.db.delete(task)
            self.db.commit()
            return True
        return False
    
    def save_generated_file(self, task_id: int, file_path: str, content: str) -> GeneratedFile:
        # Check if file already exists for this task
        existing = self.db.query(GeneratedFile).filter(
            GeneratedFile.task_id == task_id,
            GeneratedFile.file_path == file_path
        ).first()
        
        if existing:
            existing.content = content
            existing.version += 1
            self.db.commit()
            self.db.refresh(existing)
            return existing
        
        gen_file = GeneratedFile(task_id=task_id, file_path=file_path, content=content)
        self.db.add(gen_file)
        self.db.commit()
        self.db.refresh(gen_file)
        return gen_file
    
    def get_file_history(self, file_path: str):
        return self.db.query(GeneratedFile).filter(
            GeneratedFile.file_path == file_path
        ).order_by(GeneratedFile.version.desc()).all()
    
    def add_chat_message(self, project_id: int, role: str, content: str) -> ChatMessage:
        msg = ChatMessage(project_id=project_id, role=role, content=content)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg
    
    def get_chat_history(self, project_id: int):
        return self.db.query(ChatMessage).filter(
            ChatMessage.project_id == project_id
        ).order_by(ChatMessage.created_at).all()
    
    def log_execution(self, agent: str, message: str, level: str = "info"):
        log = ExecutionLog(agent=agent, message=message, level=level)
        self.db.add(log)
        self.db.commit()
        return log
    
    def get_logs(self, limit: int = 100):
        return self.db.query(ExecutionLog).order_by(
            ExecutionLog.timestamp.desc()
        ).limit(limit).all()


# Initialize on import
init_db()
