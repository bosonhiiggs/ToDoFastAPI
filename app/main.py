from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer

from .database.database import engine
from .database.models import Base
from .routers import todo, users

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todo.router)
app.include_router(users.router)
