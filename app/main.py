from fastapi import FastAPI

from .database.database import engine
from .database.models import Base
from .routers import todo

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todo.router)
