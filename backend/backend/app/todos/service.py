from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.todos.repository import TodoRepository, commit_or_rollback
from app.todos.schemas import TodoCreate, TodoUpdate
from app.todos.models import Todo


class TodoService:
    """Business/service layer for Todos with safe error handling."""

    def __init__(self, db: Session) -> None:
        """
        Initialize service with a DB session.

        Args:
            db: SQLAlchemy session.
        """
        self._db: Session = db
        self._repo: TodoRepository = TodoRepository(db)

    def create(self, payload: TodoCreate) -> Todo:
        """Create a Todo with transactional safety."""
        try:
            todo: Todo = self._repo.create(payload)
            commit_or_rollback(self._db)
            return todo
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while creating todo.",
            )

    def get(self, todo_id: int) -> Todo:
        """Get a Todo by id or raise 404."""
        todo: Todo | None = self._repo.get_by_id(todo_id)
        if todo is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found.",
            )
        return todo

    def list(self, *, skip: int = 0, limit: int = 50) -> list[Todo]:
        """List Todos with bounded pagination."""
        safe_skip: int = max(0, skip)
        safe_limit: int = min(max(1, limit), 100)
        try:
            return self._repo.list(skip=safe_skip, limit=safe_limit)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while listing todos.",
            )

    def update(self, todo_id: int, payload: TodoUpdate) -> Todo:
        """Update a Todo by id or raise 404."""
        todo: Todo = self.get(todo_id)
        try:
            updated: Todo = self._repo.update(todo, payload)
            commit_or_rollback(self._db)
            return updated
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while updating todo.",
            )

    def delete(self, todo_id: int) -> None:
        """Delete a Todo by id or raise 404."""
        todo: Todo = self.get(todo_id)
        try:
            self._repo.delete(todo)
            commit_or_rollback(self._db)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while deleting todo.",
            )