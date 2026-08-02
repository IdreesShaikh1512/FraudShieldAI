from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import require_analyst_or_above
from app.services.report_service import ReportService
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    format: str

@router.post('/reports/generate')
async def generate_report(data: ReportRequest, db: AsyncSession = Depends(get_db), current_user = Depends(require_analyst_or_above)):
    report_id = await ReportService.generate_report(db, current_user.id, data.date_from, data.date_to, data.format)
    return {'report_id': report_id}

@router.get('/reports/{report_id}/download')
async def download_report(report_id: str, current_user = Depends(require_analyst_or_above)):
    content, content_type = ReportService.get_report(report_id)
    ext = 'pdf' if 'pdf' in content_type else 'csv'
    return Response(content=content, media_type=content_type, headers={'Content-Disposition': f'attachment; filename="report_{report_id}.{ext}"'})
