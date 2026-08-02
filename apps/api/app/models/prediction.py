import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Boolean, CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)


class Prediction(Base):
    __tablename__ = 'predictions'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    transaction_id: Mapped[str] = mapped_column(String(36), ForeignKey('transactions.id'), nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_tier: Mapped[str] = mapped_column(String, CheckConstraint("risk_tier IN ('low','medium','high','critical')"), nullable=False, index=True)
    is_fraud_predicted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    explanation: Mapped[str] = mapped_column(String, nullable=True)   # stored as JSON string
    analyst_override: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    overridden_by: Mapped[str] = mapped_column(String(36), ForeignKey('users.id'), nullable=True)
    overridden_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False, index=True)

    transaction = relationship('Transaction', back_populates='predictions')
    overrider = relationship('User')
