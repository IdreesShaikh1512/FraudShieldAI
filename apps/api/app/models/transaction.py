import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc)


class Transaction(Base):
    __tablename__ = 'transactions'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    external_ref: Mapped[str] = mapped_column(String, nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    txn_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)

    # Real ML features stored as JSON string (Time, Amount, V1-V28)
    features: Mapped[str] = mapped_column(String, nullable=False, default='{}')

    # Synthetic enrichment: NOT used as ML model inputs
    merchant_name: Mapped[str] = mapped_column(String, nullable=True)
    merchant_category: Mapped[str] = mapped_column(String, nullable=True)
    country_code: Mapped[str] = mapped_column(String(2), nullable=True)
    card_last4: Mapped[str] = mapped_column(String(4), nullable=True)
    device_type: Mapped[str] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False)

    predictions = relationship('Prediction', back_populates='transaction', cascade='all, delete-orphan')
