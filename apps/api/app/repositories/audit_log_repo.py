import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.audit_log import AuditLog
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class AuditLogRepository:
    @staticmethod
    async def create(db: AsyncSession, user_id: Optional[UUID], action: str, resource_type: Optional[str] = None, resource_id: Optional[str] = None, metadata: dict = None, ip_address: str = None, user_agent: str = None) -> AuditLog:
        extra_str = json.dumps(metadata) if isinstance(metadata, (dict, list)) else metadata
        log = AuditLog(
            user_id=str(user_id) if user_id else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            extra_data=extra_str,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(log)
        await db.flush()
        return log

    @staticmethod
    async def list_logs(db: AsyncSession, page: int, limit: int, user_id: Optional[UUID] = None, action: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> tuple[List[AuditLog], int]:
        query = select(AuditLog)
        if user_id:
            query = query.where(AuditLog.user_id == str(user_id))
        if action:
            query = query.where(AuditLog.action == action)
        if date_from:
            query = query.where(AuditLog.created_at >= date_from)
        if date_to:
            query = query.where(AuditLog.created_at <= date_to)
            
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)
        
        query = query.offset((page - 1) * limit).limit(limit).order_by(AuditLog.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all()), total or 0
