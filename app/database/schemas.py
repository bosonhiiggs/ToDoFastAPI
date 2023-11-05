from pydantic import BaseModel


class TodoBase(BaseModel):
    title: str
    description: str | None = None
    is_completed: bool = False


class TodoCreate(TodoBase):
    pass


class Todo(TodoBase):
    id: int

    class Config:
        from_attributes = True
