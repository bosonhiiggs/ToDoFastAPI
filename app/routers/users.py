from typing import Annotated

from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends
from fastapi.security.oauth2 import OAuth2PasswordRequestForm

from ..common import get_hashed_password
from ..dependencies import get_db
from ..database.schemas import User, UserCreate

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.get("/")
async def get_users():
    return {"Plug": "Users List"}


@router.post("/create")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    username = user.username
    password = get_hashed_password(user.hashed_password)

    # return {"username": username, "hashed_password": password}
    return {"Register has successfully"}

# @router.post("/create")
# async def create_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
#     # user = UserCreate(form_data.username, form_data.password)
#     return form_data
