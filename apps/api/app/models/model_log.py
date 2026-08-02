import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)


class ModelLog(Base):
    __tablename__ = 'model_logs'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    model_name: Mapped[str] = mapped_column(String, nullable=False)
    version: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)
    pr_auc: Mapped[float] = mapped_column(Float, nullable=True)
    f1_minority: Mapped[float] = mapped_column(Float, nullable=True)
    recall_at_90p: Mapped[float] = mapped_column(Float, nullable=True)
    roc_auc: Mapped[float] = mapped_column(Float, nullable=True)
    dataset_hash: Mapped[str] = mapped_column(String, nullable=True)
    hyperparameters: Mapped[str] = mapped_column(String, nullable=True)   # stored as JSON string
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False)
