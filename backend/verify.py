import sys
from app.config import settings
from app.database import Base, engine
from app.models import Company, Application, Tag, InterviewRound, InterviewFeedback, TimelineEvent

print("Python executable:", sys.executable)
print("Config loaded successfully! Enums count:", len(settings.enums.application_statuses))
print("Database URL:", settings.database.url)

Base.metadata.create_all(bind=engine)
print("All SQLite tables created successfully!")
