import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from app.models.prediction import Prediction
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
import sqlalchemy

class PredictionRepository:
    @staticmethod
    async def create(db: AsyncSession, transaction_id: UUID, model_version: str, risk_score: float, risk_tier: str, is_fraud_predicted: bool, explanation: dict) -> Prediction:
        exp_str = json.dumps(explanation) if isinstance(explanation, (dict, list)) else explanation
        pred = Prediction(
            transaction_id=str(transaction_id),
            model_version=model_version,
            risk_score=risk_score,
            risk_tier=risk_tier,
            is_fraud_predicted=is_fraud_predicted,
            explanation=exp_str
        )
        db.add(pred)
        await db.flush()
        return pred

    @staticmethod
    async def get_by_id(db: AsyncSession, pred_id: UUID) -> Optional[Prediction]:
        result = await db.execute(select(Prediction).where(Prediction.id == str(pred_id)))
        return result.scalars().first()

    @staticmethod
    async def list_predictions(db: AsyncSession, page: int, limit: int, risk_tier: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None, model_version: Optional[str] = None) -> tuple[List[Prediction], int]:
        query = select(Prediction)
        if risk_tier:
            query = query.where(Prediction.risk_tier == risk_tier)
        if model_version:
            query = query.where(Prediction.model_version == model_version)
        if date_from:
            query = query.where(Prediction.created_at >= date_from)
        if date_to:
            query = query.where(Prediction.created_at <= date_to)
            
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)
        
        query = query.offset((page - 1) * limit).limit(limit).order_by(Prediction.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all()), total or 0

    @staticmethod
    async def update_override(db: AsyncSession, pred_id: UUID, is_fraud: bool, overridden_by_user_id: UUID) -> Optional[Prediction]:
        await db.execute(
            update(Prediction)
            .where(Prediction.id == str(pred_id))
            .values(
                is_fraud_predicted=is_fraud,
                analyst_override=True,
                overridden_by=str(overridden_by_user_id),
                overridden_at=func.now()
            )
        )
        return await PredictionRepository.get_by_id(db, pred_id)

    @staticmethod
    async def get_stats(db: AsyncSession, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> Dict[str, Any]:
        query = select(
            func.count(Prediction.id).label('total'),
            func.sum(func.cast(Prediction.is_fraud_predicted, sqlalchemy.Integer)).label('fraud_count'),
            func.avg(Prediction.risk_score).label('avg_risk_score')
        )
        if date_from:
            query = query.where(Prediction.created_at >= date_from)
        if date_to:
            query = query.where(Prediction.created_at <= date_to)
            
        result = await db.execute(query)
        row = result.first()
        if not row or not row.total:
            return {'total': 0, 'fraud_count': 0, 'avg_risk_score': 0.0}
        return {'total': row.total, 'fraud_count': int(row.fraud_count or 0), 'avg_risk_score': float(row.avg_risk_score or 0.0)}
