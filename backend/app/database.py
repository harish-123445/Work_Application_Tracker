from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Enforce foreign key constraints in SQLite
connect_args = {}
if settings.database.url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database.url,
    connect_args=connect_args,
    echo=settings.database.echo_sql
)

# Enable SQLite PRAGMA foreign_keys = ON automatically on every connection
if settings.database.url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
