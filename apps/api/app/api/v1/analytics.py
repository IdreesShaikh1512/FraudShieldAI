from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.analytics import KPIResponse, ROCResponse, PRResponse, ConfusionMatrixResponse, FraudByHourResponse, FraudByDimensionResponse, FeatureImportanceResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get('/dashboard/kpis', response_model=KPIResponse)
async def get_kpis(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_kpis(db)

@router.get('/analytics/roc', response_model=ROCResponse)
async def get_roc(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_roc_data(db)

@router.get('/analytics/pr-curve', response_model=PRResponse)
async def get_pr_curve(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_pr_curve_data(db)

@router.get('/analytics/confusion-matrix', response_model=ConfusionMatrixResponse)
async def get_confusion_matrix(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_confusion_matrix(db)

@router.get('/analytics/fraud-by-hour', response_model=FraudByHourResponse)
async def get_fraud_by_hour(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_fraud_by_hour(db)

@router.get('/analytics/fraud-by-dimension', response_model=FraudByDimensionResponse)
async def get_fraud_by_dimension(dim: str, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_fraud_by_dimension(db, dim)

@router.get('/analytics/feature-importance', response_model=FeatureImportanceResponse)
async def get_feature_importance(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await AnalyticsService.get_feature_importance(db)
