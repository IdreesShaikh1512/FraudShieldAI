from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.models import router as models_router
from app.api.v1.admin import router as admin_router
from app.api.v1.reports import router as reports_router

router = APIRouter()

router.include_router(auth_router, prefix='/auth', tags=['Auth'])
router.include_router(predictions_router, tags=['Predictions'])
router.include_router(analytics_router, tags=['Analytics'])
router.include_router(models_router, tags=['Models'])
router.include_router(admin_router, prefix='/admin', tags=['Admin'])
router.include_router(reports_router, tags=['Reports'])
