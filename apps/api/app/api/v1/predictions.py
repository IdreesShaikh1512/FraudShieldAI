from fastapi import APIRouter, Depends, Request, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_analyst_or_above
from app.schemas.predictions import TransactionInput, PredictionResponse, BatchJobResponse, OverrideRequest, PredictionHistoryItem
from app.schemas.common import PaginatedResponse
from app.services.prediction_service import PredictionService
from app.repositories.prediction_repo import PredictionRepository
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid
from typing import Optional
from datetime import datetime

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post('/predict', response_model=PredictionResponse)
@limiter.limit('60/minute')
async def predict(request: Request, data: TransactionInput, db: AsyncSession = Depends(get_db), current_user = Depends(require_analyst_or_above)):
    return await PredictionService.predict_single(db, data, current_user.id, request)

@router.post('/predict/batch', response_model=BatchJobResponse)
async def predict_batch(request: Request, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), current_user = Depends(require_analyst_or_above)):
    content = await file.read()
    job_id = await PredictionService.predict_batch(db, content, current_user.id, request)
    return PredictionService.get_batch_status(job_id)

@router.get('/predict/batch/{job_id}', response_model=BatchJobResponse)
async def get_batch(job_id: str, current_user = Depends(require_analyst_or_above)):
    return PredictionService.get_batch_status(job_id)

@router.get('/predictions', response_model=PaginatedResponse[PredictionHistoryItem])
async def list_predictions(page: int = 1, limit: int = 20, risk_tier: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    preds, total = await PredictionRepository.list_predictions(db, page, limit, risk_tier, date_from, date_to)
    
    items = []
    for p in preds:
        items.append({
            'id': p.id,
            'transaction_id': p.transaction_id,
            'risk_score': p.risk_score,
            'risk_tier': p.risk_tier,
            'is_fraud_predicted': p.is_fraud_predicted,
            'explanation': p.explanation,
            'model_version': p.model_version,
            'created_at': p.created_at,
            'confidence_pct': float(p.risk_score) * 100,
            'transaction_amount': 0.0, # MOCK
            'country_code': None, # MOCK
            'merchant_name': None # MOCK
        })
    return PaginatedResponse(items=items, total=total, page=page, limit=limit, pages=(total + limit - 1) // limit)

@router.get('/predictions/{id}')
async def get_prediction(id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    pred = await PredictionRepository.get_by_id(db, id)
    return pred

@router.patch('/predictions/{id}/override')
async def override_prediction(request: Request, id: uuid.UUID, data: OverrideRequest, db: AsyncSession = Depends(get_db), current_user = Depends(require_analyst_or_above)):
    return await PredictionService.override_prediction(db, id, data.is_fraud, data.reason, current_user.id, request)
