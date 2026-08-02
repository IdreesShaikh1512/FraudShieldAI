from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import uuid
import pandas as pd
from fpdf import FPDF
from datetime import datetime
from typing import Optional

_reports = {}

class ReportService:
    @staticmethod
    async def generate_report(db: AsyncSession, user_id: uuid.UUID, date_from: Optional[datetime], date_to: Optional[datetime], fmt: str) -> str:
        report_id = str(uuid.uuid4())
        
        # simplified mock report generation
        if fmt == 'csv':
            content = b"id,amount,risk_score\n1,100,0.1\n2,200,0.8\n"
            content_type = 'text/csv'
        elif fmt == 'pdf':
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=12)
            pdf.cell(200, 10, txt="FraudShield AI Report", ln=1, align="C")
            content = pdf.output(dest='S').encode('latin-1')
            content_type = 'application/pdf'
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
            
        _reports[report_id] = (content, content_type)
        return report_id

    @staticmethod
    def get_report(report_id: str):
        report = _reports.get(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return report[0], report[1]
