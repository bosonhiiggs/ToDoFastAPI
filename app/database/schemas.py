from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


class TodoBase(BaseModel):
    title: str
    description: str | None = None
    is_completed: bool = False


class TodoCreate(TodoBase):
    owner_id: int


class Todo(TodoBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    hashed_password: str


class User(UserBase):
    id: int
    todos: list[Todo] = []

    class Config:
        from_attributes = True
