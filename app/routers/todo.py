from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import crud
from ..database.schemas import Todo, TodoCreate
from ..dependencies import get_db

router = APIRouter(
    prefix="/todo",
    tags=["todos"]
)


@router.get("/", response_model=list[Todo])
async def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db=db, skip=skip, limit=limit)
    if not todos:
        raise HTTPException(status_code=400, detail="Todos doesn't exist")
    return todos


@router.get("/{todo_id}", response_model=Todo)
async def get_item(todo_id: int, db: Session = Depends(get_db)):
    todo = crud.get_todo(db=db, todo_id=todo_id)
    if todo is None:
        raise HTTPException(status_code=400, detail="Todo with this ID don't exist")
    return todo


@router.post("/create", response_model=Todo)
async def create_item(data: TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=data)


@router.put("/{todo_id}", response_model=Todo)
async def update_item(
        todo_id: int,
        new_title: str | None = None,
        new_description: str | None = None,
        new_status: bool = False,
        db: Session = Depends(get_db)
):
    todo = crud.update_todo(
        db=db,
        todo_id=todo_id,
        new_title=new_title,
        new_description=new_description,
        new_status=new_status,
    )
    if todo is None:
        raise HTTPException(status_code=400, detail="Todo with this ID don't exist")
    return todo


@router.delete("{todo_id}")
async def delete_item(todo_id: int, db: Session = Depends(get_db)):
    status_delete = crud.delete_todo(db=db, todo_id=todo_id)
    if not status_delete:
        raise HTTPException(status_code=400, detail="Todo with this ID don't exist")
    return {"Delete was successfully"}
