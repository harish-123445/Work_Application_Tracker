import os
import yaml
from pathlib import Path
from typing import List, Dict, Any
from pydantic import BaseModel, Field

CONFIG_FILE_PATH = Path(__file__).resolve().parent.parent / "config.yaml"

class EnumItem(BaseModel):
    key: str
    label: str
    color: str | None = None
    is_terminal: bool | None = None
    order: int | None = None

class ServerConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8000
    reload: bool = True
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])

class DatabaseConfig(BaseModel):
    url: str = "sqlite:///./tracker.db"
    echo_sql: bool = False

class EnumsConfig(BaseModel):
    application_statuses: List[EnumItem]
    work_modes: List[EnumItem]
    interview_round_types: List[EnumItem]
    interview_outcomes: List[EnumItem]
    timeline_event_types: List[EnumItem]

class AnalyticsConfig(BaseModel):
    ghosting_threshold_days: int = 14
    funnel_stages: List[str]

class AppConfig(BaseModel):
    server: ServerConfig
    database: DatabaseConfig
    enums: EnumsConfig
    analytics: AnalyticsConfig

    @property
    def valid_application_statuses(self) -> List[str]:
        return [item.key for item in self.enums.application_statuses]

    @property
    def valid_work_modes(self) -> List[str]:
        return [item.key for item in self.enums.work_modes]

    @property
    def valid_interview_round_types(self) -> List[str]:
        return [item.key for item in self.enums.interview_round_types]

    @property
    def valid_interview_outcomes(self) -> List[str]:
        return [item.key for item in self.enums.interview_outcomes]

    @property
    def valid_timeline_event_types(self) -> List[str]:
        return [item.key for item in self.enums.timeline_event_types]

def load_config() -> AppConfig:
    if not CONFIG_FILE_PATH.exists():
        raise FileNotFoundError(f"Configuration file not found at: {CONFIG_FILE_PATH}")
    with open(CONFIG_FILE_PATH, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return AppConfig(**data)

settings = load_config()
