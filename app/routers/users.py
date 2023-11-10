from datetime import timedelta
from typing import Annotated

from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from config import ACCESS_TOKEN_EXPIRE_MINUTES
from ..common import authenticate_user, get_hashed_password, create_access_token, get_current_user
from ..dependencies import get_db
from ..database.schemas import User, UserBase, UserCreate
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


@router.get("/me/todos")
async def get_user(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "username": current_user.username,
        "todos": current_user.todos
    }


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
