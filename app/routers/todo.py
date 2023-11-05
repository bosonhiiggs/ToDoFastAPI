from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database.crud import create_todo
from ..database.schemas import Todo, TodoCreate
from ..dependencies import get_db


router = APIRouter(
    prefix="/items",
    tags=["items"]
)


@router.post("/create", response_model=Todo)
async def create_item(data: TodoCreate, db: Session = Depends(get_db)):
    return create_todo(db=db, todo=data)
