from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import require_admin, require_auditor_or_above
from app.repositories.user_repo import UserRepository
from app.repositories.audit_log_repo import AuditLogRepository
from app.schemas.auth import UserUpdateRequest
from uuid import UUID

router = APIRouter()

@router.get('/users')
async def list_users(page: int = 1, limit: int = 20, db: AsyncSession = Depends(get_db), current_user = Depends(require_admin)):
    users, total = await UserRepository.list_users(db, page, limit)
    return {'items': users, 'total': total, 'page': page, 'limit': limit}

@router.patch('/users/{user_id}')
async def update_user(user_id: UUID, data: UserUpdateRequest, request: Request, db: AsyncSession = Depends(get_db), current_user = Depends(require_admin)):
    update_data = data.model_dump(exclude_unset=True)
    user = await UserRepository.update(db, user_id, **update_data)
    from app.services.audit_service import AuditService
    await AuditService.log(db, current_user.id, AuditService.ACTIONS.USER_UPDATED, 'User', str(user_id), metadata=update_data, request=request)
    return user

@router.get('/audit-logs')
async def get_audit_logs(page: int = 1, limit: int = 50, db: AsyncSession = Depends(get_db), current_user = Depends(require_auditor_or_above)):
    logs, total = await AuditLogRepository.list_logs(db, page, limit)
    return {'items': logs, 'total': total, 'page': page, 'limit': limit}
