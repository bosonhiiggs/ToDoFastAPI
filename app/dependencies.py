from .database.database import SessionLocal


# Инъекция подключения к БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Инъекции для авторизации

