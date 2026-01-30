from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.todos.schemas import TodoCreate, TodoOut, TodoUpdate
from app.todos.service import TodoService

router = APIRouter(prefix="/todos", tags=["todos"])


def get_service(db: Session = Depends(get_db)) -> TodoService:
    """Dependency to provide TodoService."""
    return TodoService(db)


@router.post("", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, service: TodoService = Depends(get_service)) -> TodoOut:
    """Create a new Todo."""
    return service.create(payload)


@router.get("", response_model=list[TodoOut])
def list_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service: TodoService = Depends(get_service),
) -> list[TodoOut]:
    """List todos with pagination."""
    return service.list(skip=skip, limit=limit)


@router.get("/{todo_id}", response_model=TodoOut)
def get_todo(todo_id: int, service: TodoService = Depends(get_service)) -> TodoOut:
    """Get a Todo by id."""
    return service.get(todo_id)


@router.patch("/{todo_id}", response_model=TodoOut)
def update_todo(todo_id: int, payload: TodoUpdate, service: TodoService = Depends(get_service)) -> TodoOut:
    """Partially update a Todo by id."""
    return service.update(todo_id, payload)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, service: TodoService = Depends(get_service)) -> None:
    """Delete a Todo by id."""
    service.delete(todo_id)
    return None