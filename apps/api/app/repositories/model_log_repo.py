import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.model_log import ModelLog
from typing import Optional, List
from datetime import datetime

class ModelLogRepository:
    @staticmethod
    async def create(db: AsyncSession, model_name: str, version: str, trained_at: datetime, metrics_dict: dict, hyperparameters: dict, dataset_hash: str) -> ModelLog:
        hp_str = json.dumps(hyperparameters) if isinstance(hyperparameters, (dict, list)) else hyperparameters
        mlog = ModelLog(
            model_name=model_name,
            version=version,
            trained_at=trained_at,
            pr_auc=metrics_dict.get('pr_auc'),
            f1_minority=metrics_dict.get('f1_minority'),
            recall_at_90p=metrics_dict.get('recall_at_90p'),
            roc_auc=metrics_dict.get('roc_auc'),
            dataset_hash=dataset_hash,
            hyperparameters=hp_str
        )
        db.add(mlog)
        await db.flush()
        return mlog

    @staticmethod
    async def get_active(db: AsyncSession) -> Optional[ModelLog]:
        result = await db.execute(select(ModelLog).where(ModelLog.is_active == True))
        return result.scalars().first()

    @staticmethod
    async def get_by_version(db: AsyncSession, version: str) -> Optional[ModelLog]:
        result = await db.execute(select(ModelLog).where(ModelLog.version == version))
        return result.scalars().first()

    @staticmethod
    async def list_all(db: AsyncSession) -> List[ModelLog]:
        result = await db.execute(select(ModelLog).order_by(ModelLog.created_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def activate_version(db: AsyncSession, version: str) -> Optional[ModelLog]:
        await db.execute(update(ModelLog).values(is_active=False))
        result = await db.execute(update(ModelLog).where(ModelLog.version == version).values(is_active=True))
        return await ModelLogRepository.get_by_version(db, version)
