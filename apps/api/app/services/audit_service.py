from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_log_repo import AuditLogRepository
from typing import Optional
from uuid import UUID

class AuditService:
    class ACTIONS:
        USER_REGISTERED = 'USER_REGISTERED'
        USER_LOGGED_IN = 'USER_LOGGED_IN'
        USER_LOGGED_OUT = 'USER_LOGGED_OUT'
        PREDICTION_CREATED = 'PREDICTION_CREATED'
        PREDICTION_OVERRIDDEN = 'PREDICTION_OVERRIDDEN'
        BATCH_JOB_CREATED = 'BATCH_JOB_CREATED'
        MODEL_ACTIVATED = 'MODEL_ACTIVATED'
        USER_UPDATED = 'USER_UPDATED'
        PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED'

    @staticmethod
    async def log(db: AsyncSession, user_id: Optional[UUID], action: str, resource_type: Optional[str] = None, resource_id: Optional[str] = None, metadata: dict = None, request: Optional[Request] = None):
        ip_address = None
        user_agent = None
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get('user-agent')
            forwarded = request.headers.get('x-forwarded-for')
            if forwarded:
                ip_address = forwarded.split(',')[0].strip()
                
        return await AuditLogRepository.create(
            db=db,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent
        )
