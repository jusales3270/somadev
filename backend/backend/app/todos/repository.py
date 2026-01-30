from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.todos.models import Todo
from app.todos.schemas import TodoCreate, TodoUpdate


class TodoRepository:
    """Data access layer (CRUD) for Todo entities."""

    def __init__(self, db: Session) -> None:
        """
        Initialize repository with a SQLAlchemy session.

        Args:
            db: SQLAlchemy session.
        """
        self._db: Session = db

    def create(self, payload: TodoCreate) -> Todo:
        """
        Create a new Todo.

        Args:
            payload: Todo creation payload.

        Returns:
            The created Todo ORM instance.

        Raises:
            SQLAlchemyError: If database operation fails.
        """
        todo: Todo = Todo(
            title=payload.title,
            description=payload.description,
            is_done=payload.is_done,
        )
        self._db.add(todo)
        self._db.flush()  # assign PK
        self._db.refresh(todo)
        return todo

    def get_by_id(self, todo_id: int) -> Todo | None:
        """
        Fetch a Todo by id.

        Args:
            todo_id: Todo identifier.

        Returns:
            Todo instance or None.
        """
        stmt = select(Todo).where(Todo.id == todo_id)
        return self._db.execute(stmt).scalar_one_or_none()

    def list(self, *, skip: int = 0, limit: int = 50) -> list[Todo]:
        """
        List Todos with pagination.

        Args:
            skip: Offset.
            limit: Max items (bounded by service layer or router).

        Returns:
            List of Todo instances.
        """
        stmt = select(Todo).offset(skip).limit(limit).order_by(Todo.id.desc())
        return list(self._db.execute(stmt).scalars().all())

    def update(self, todo: Todo, payload: TodoUpdate) -> Todo:
        """
        Update an existing Todo (partial update).

        Args:
            todo: Existing Todo ORM instance.
            payload: Update payload.

        Returns:
            Updated Todo ORM instance.
        """
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(todo, key, value)
        self._db.add(todo)
        self._db.flush()
        self._db.refresh(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        """
        Delete a Todo.

        Args:
            todo: Existing Todo ORM instance.
        """
        self._db.delete(todo)
        self._db.flush()


def commit_or_rollback(db: Session) -> None:
    """
    Commit the current transaction, rollback on failure.

    This helper prevents leaking SQL errors and ensures consistent state.

    Args:
        db: SQLAlchemy session.

    Raises:
        SQLAlchemyError: Re-raised after rollback for upper layers to translate.
    """
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise