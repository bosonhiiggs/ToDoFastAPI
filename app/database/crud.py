from sqlalchemy.orm import Session


from . import models, schemas


def create_todo(db: Session, todo: schemas.TodoCreate):
    db_todo = models.Todo(title=todo.title, description=todo.description, is_completed=todo.is_completed)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo
