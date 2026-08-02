from sqlalchemy import String, DateTime, text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from datetime import datetime
import json


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    # This table is append-only. UPDATE and DELETE are revoked at the DB level for the app role.

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: __import__('uuid').uuid4().hex)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey('users.id'), nullable=True)
    action: Mapped[str] = mapped_column(String, nullable=False)
    resource_type: Mapped[str] = mapped_column(String, nullable=True)
    resource_id: Mapped[str] = mapped_column(String, nullable=True)
    extra_data: Mapped[str] = mapped_column(String, nullable=True)   # stored as JSON string
    ip_address: Mapped[str] = mapped_column(String, nullable=True)
    user_agent: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: __import__('datetime').datetime.now(__import__('datetime').timezone.utc), nullable=False, index=True)
