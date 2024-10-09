import logging
from typing import Annotated, Optional

from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse, RedirectResponse
from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates

from .database.database import engine
from .database.models import Base, User
from .dependencies import get_current_user, get_db, oauth2_scheme
from .routers import todo, users

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todo.router)
app.include_router(users.router)

templates = Jinja2Templates(directory="app/templates")

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", name='login', response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register", name='register', response_class=HTMLResponse)
async def register_root(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/dashboard", name='dashboard', response_class=HTMLResponse)
async def dashboard(request: Request):
    # print(request.headers)
    return templates.TemplateResponse("dashboard.html", {"request": request})

