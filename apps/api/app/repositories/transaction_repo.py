import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.transaction import Transaction
from app.models.prediction import Prediction
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TransactionRepository:
    @staticmethod
    async def create(db: AsyncSession, amount: float, txn_time: datetime, features: dict, enrichment_data: dict) -> Transaction:
        feat_str = json.dumps(features) if isinstance(features, (dict, list)) else features
        txn = Transaction(
            amount=amount,
            txn_time=txn_time,
            features=feat_str,
            merchant_name=enrichment_data.get('merchant_name'),
            merchant_category=enrichment_data.get('merchant_category'),
            country_code=enrichment_data.get('country_code'),
            card_last4=enrichment_data.get('card_last4'),
            device_type=enrichment_data.get('device_type')
        )
        db.add(txn)
        await db.flush()
        return txn

    @staticmethod
    async def get_by_id(db: AsyncSession, txn_id: UUID) -> Optional[Transaction]:
        result = await db.execute(select(Transaction).where(Transaction.id == str(txn_id)))
        return result.scalars().first()

    @staticmethod
    async def list_transactions(db: AsyncSession, page: int, limit: int, country_code: Optional[str] = None, risk_tier: Optional[str] = None, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> tuple[List[Transaction], int]:
        query = select(Transaction)
        if risk_tier:
            query = query.join(Prediction).where(Prediction.risk_tier == risk_tier)
        if country_code:
            query = query.where(Transaction.country_code == country_code)
        if date_from:
            query = query.where(Transaction.txn_time >= date_from)
        if date_to:
            query = query.where(Transaction.txn_time <= date_to)
        
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)
        
        query = query.offset((page - 1) * limit).limit(limit).order_by(Transaction.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all()), total or 0
