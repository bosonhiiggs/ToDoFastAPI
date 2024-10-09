from datetime import timedelta
from typing import Annotated

from forismatic import forismatic
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from ..config import ACCESS_TOKEN_EXPIRE_MINUTES
from ..common import authenticate_user, get_hashed_password, create_access_token, check_todo_in_todos_current_user
from ..dependencies import get_db, get_current_user
from ..database.schemas import TodoBase, Todo, TodoCreate, User, UserBase, UserCreate, TodoUpdate
from ..database import crud

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.post("/token")
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: Session = Depends(get_db)
):
    user = authenticate_user(db=db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/")
async def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db=db)


@router.get("/me/", response_model=UserBase)
async def get_user(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.post("/me/create")
async def create_todo(
        data: TodoBase,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Session = Depends(get_db)
):
    user_id = current_user.id
    todo = TodoCreate(title=data.title, description=data.description, is_completed=data.is_completed, owner_id=user_id)
    todo_db = crud.create_todo(db=db, todo=todo)
    return todo_db


@router.get("/me/todos")
async def get_todos_current_user(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user.todos


@router.get("/me/todos/{todo_id}")
async def get_todo_current_user(todo_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    todos = current_user.todos
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return HTTPException(status_code=400, detail="Invalid ID")


@router.put("/me/todos/{todo_id}")
async def put_todo_current_user(
        todo_id: int,
        update_data: TodoUpdate,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Session = Depends(get_db),
        # new_title: str | None = None,
        # new_description: str | None = None,
        # new_status: bool = None,
):
    if check_todo_in_todos_current_user(user=current_user, todo_id=todo_id):
        todo = crud.update_todo(
            db=db,
            todo_id=todo_id,
            new_title=update_data.new_title,
            new_description=update_data.new_description,
            new_status=update_data.new_status,
        )
        if update_data.new_status:
            f = forismatic.ForismaticPy()
            phrase = f.get_Quote('ru')
            response = [todo, phrase[0]]
            return response
        return todo
    return HTTPException(status_code=400, detail="Invalid ID")


@router.delete("/me/todos/{todo_id}")
async def delete_todo_current_user(
        todo_id: int,
        current_user: Annotated[User, Depends(get_current_user)],
        db: Session = Depends(get_db),
):
    if check_todo_in_todos_current_user(user=current_user, todo_id=todo_id):
        delete_flag = crud.delete_todo(db=db, todo_id=todo_id)
        if delete_flag:
            return {"Notice": f"Todo with id={todo_id} was delete successfully"}
    return HTTPException(status_code=400, detail="Invalid ID")


@router.post("/create")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    exist_user = crud.get_user_by_username(db=db, username=user.username)

    if exist_user:
        raise HTTPException(
            status_code=400,
            detail="User with this username already exist"
        )

    password = get_hashed_password(user.hashed_password)
    user.hashed_password = password
    status = crud.create_user(db=db, user=user)
    return {"Answer": status}
