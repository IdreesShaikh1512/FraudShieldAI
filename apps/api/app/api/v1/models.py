from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.repositories.model_log_repo import ModelLogRepository
from app.services.audit_service import AuditService
from app.ml.inference import ml_service

router = APIRouter()

@router.get('/models')
async def list_models(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    models = await ModelLogRepository.list_all(db)
    return models

@router.get('/models/{version}/metrics')
async def get_metrics(version: str, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    mlog = await ModelLogRepository.get_by_version(db, version)
    if not mlog:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Model not found")
    return {
        'pr_auc': mlog.pr_auc,
        'f1_minority': mlog.f1_minority,
        'recall_at_90p': mlog.recall_at_90p,
        'roc_auc': mlog.roc_auc,
        'hyperparameters': mlog.hyperparameters
    }

@router.post('/models/{version}/activate')
async def activate_model(version: str, request: Request, db: AsyncSession = Depends(get_db), current_user = Depends(require_admin)):
    mlog = await ModelLogRepository.activate_version(db, version)
    if not mlog:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Model not found")
    ml_service.load_models() # Reload models
    await AuditService.log(db, current_user.id, AuditService.ACTIONS.MODEL_ACTIVATED, 'Model', version, request=request)
    return mlog
