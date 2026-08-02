from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.transaction_repo import TransactionRepository
from app.repositories.prediction_repo import PredictionRepository
from app.services.audit_service import AuditService
from app.ml.inference import ml_service
from app.ml.enrichment import SyntheticEnrichmentService
import asyncio
import uuid
import csv
import io
from datetime import datetime, timezone
import traceback

_batch_jobs = {}

class PredictionService:
    @staticmethod
    async def predict_single(db: AsyncSession, transaction_input, user_id: uuid.UUID, request=None):
        amount = transaction_input.amount
        txn_time_val = transaction_input.time
        features = transaction_input.model_dump()
        
        enrichment_data = SyntheticEnrichmentService.enrich_transaction(amount)
        txn_time = datetime.fromtimestamp(txn_time_val, tz=timezone.utc) if txn_time_val > 1000000000 else datetime.now(timezone.utc)
        
        txn = await TransactionRepository.create(db, amount, txn_time, features, enrichment_data)
        
        prediction_result = ml_service.predict(features)
        
        pred = await PredictionRepository.create(
            db=db,
            transaction_id=txn.id,
            model_version=prediction_result['model_version'],
            risk_score=prediction_result['risk_score'],
            risk_tier=prediction_result['risk_tier'],
            is_fraud_predicted=prediction_result['is_fraud_predicted'],
            explanation=prediction_result['explanation']
        )
        
        await AuditService.log(db, user_id, AuditService.ACTIONS.PREDICTION_CREATED, 'Prediction', str(pred.id), request=request)
        
        return {
            'id': pred.id,
            'transaction_id': txn.id,
            'risk_score': float(pred.risk_score),
            'risk_tier': pred.risk_tier,
            'is_fraud_predicted': pred.is_fraud_predicted,
            'explanation': pred.explanation,
            'model_version': pred.model_version,
            'created_at': pred.created_at,
            'confidence_pct': float(pred.risk_score) * 100
        }

    @staticmethod
    async def predict_batch(db: AsyncSession, csv_content: bytes, user_id: uuid.UUID, request=None) -> str:
        job_id = str(uuid.uuid4())
        
        text = csv_content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)
        
        _batch_jobs[job_id] = {
            'job_id': job_id,
            'status': 'pending',
            'total_rows': len(rows),
            'processed_rows': 0,
            'download_url': None,
            'error_message': None
        }
        
        asyncio.create_task(PredictionService._process_batch(job_id, rows, user_id))
        await AuditService.log(db, user_id, AuditService.ACTIONS.BATCH_JOB_CREATED, 'BatchJob', job_id, request=request)
        return job_id

    @staticmethod
    async def _process_batch(job_id: str, rows: list, user_id: uuid.UUID):
        try:
            _batch_jobs[job_id]['status'] = 'processing'
            from app.core.database import AsyncSessionLocal
            
            async with AsyncSessionLocal() as db:
                for row in rows:
                    amount = float(row.get('amount', row.get('Amount', 0)))
                    time_val = float(row.get('time', row.get('Time', 0)))
                    features = {'amount': amount, 'time': time_val}
                    for i in range(1, 29):
                        key = f'v{i}'
                        val = row.get(key, row.get(key.upper(), 0))
                        features[key] = float(val)
                    
                    enrichment_data = SyntheticEnrichmentService.enrich_transaction(amount)
                    txn_time = datetime.now(timezone.utc)
                    txn = await TransactionRepository.create(db, amount, txn_time, features, enrichment_data)
                    
                    prediction_result = ml_service.predict(features)
                    await PredictionRepository.create(
                        db=db,
                        transaction_id=txn.id,
                        model_version=prediction_result['model_version'],
                        risk_score=prediction_result['risk_score'],
                        risk_tier=prediction_result['risk_tier'],
                        is_fraud_predicted=prediction_result['is_fraud_predicted'],
                        explanation=prediction_result['explanation']
                    )
                    
                    _batch_jobs[job_id]['processed_rows'] += 1
                await db.commit()
            
            _batch_jobs[job_id]['status'] = 'completed'
        except Exception as e:
            _batch_jobs[job_id]['status'] = 'failed'
            _batch_jobs[job_id]['error_message'] = str(e)
            traceback.print_exc()

    @staticmethod
    def get_batch_status(job_id: str):
        job = _batch_jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    async def override_prediction(db: AsyncSession, pred_id: uuid.UUID, is_fraud: bool, reason: str, user_id: uuid.UUID, request=None):
        pred = await PredictionRepository.update_override(db, pred_id, is_fraud, user_id)
        if not pred:
            raise HTTPException(status_code=404, detail="Prediction not found")
        await AuditService.log(db, user_id, AuditService.ACTIONS.PREDICTION_OVERRIDDEN, 'Prediction', str(pred.id), metadata={'reason': reason}, request=request)
        return pred
