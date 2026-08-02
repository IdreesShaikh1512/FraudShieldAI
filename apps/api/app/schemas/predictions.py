from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from uuid import UUID
from datetime import datetime

class TransactionInput(BaseModel):
    amount: float = Field(gt=0)
    time: float = Field(ge=0, le=172800)
    v1: float
    v2: float
    v3: float
    v4: float
    v5: float
    v6: float
    v7: float
    v8: float
    v9: float
    v10: float
    v11: float
    v12: float
    v13: float
    v14: float
    v15: float
    v16: float
    v17: float
    v18: float
    v19: float
    v20: float
    v21: float
    v22: float
    v23: float
    v24: float
    v25: float
    v26: float
    v27: float
    v28: float

class SHAPFeature(BaseModel):
    feature_name: str
    value: float
    shap_value: float
    contribution_pct: float

class PredictionResponse(BaseModel):
    id: UUID
    transaction_id: UUID
    risk_score: float
    risk_tier: str
    is_fraud_predicted: bool
    explanation: List[SHAPFeature]
    model_version: str
    created_at: datetime
    confidence_pct: float

class BatchJobResponse(BaseModel):
    job_id: str
    status: Literal['pending', 'processing', 'completed', 'failed']
    total_rows: int
    processed_rows: int
    download_url: Optional[str] = None
    error_message: Optional[str] = None

class PredictionHistoryItem(PredictionResponse):
    transaction_amount: float
    country_code: Optional[str]
    merchant_name: Optional[str]

class OverrideRequest(BaseModel):
    is_fraud: bool
    reason: str = Field(min_length=5)
