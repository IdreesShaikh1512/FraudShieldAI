from pydantic import BaseModel
from typing import List

class KPIResponse(BaseModel):
    total_transactions: int
    total_fraud: int
    fraud_rate: float
    avg_risk_score: float
    active_model_version: str
    period_label: str

class ROCPoint(BaseModel):
    fpr: float
    tpr: float
    threshold: float

class ROCResponse(BaseModel):
    points: List[ROCPoint]
    auc: float
    model_version: str

class PRPoint(BaseModel):
    precision: float
    recall: float
    threshold: float

class PRResponse(BaseModel):
    points: List[PRPoint]
    auc: float
    baseline: float
    model_version: str

class ConfusionMatrixResponse(BaseModel):
    tp: int
    tn: int
    fp: int
    fn: int
    accuracy: float
    precision: float
    recall: float
    f1: float

class FraudByHourPoint(BaseModel):
    hour: int
    total: int
    fraud: int
    fraud_rate: float

class FraudByHourResponse(BaseModel):
    points: List[FraudByHourPoint]

class FraudByDimensionPoint(BaseModel):
    label: str
    total: int
    fraud: int
    fraud_rate: float

class FraudByDimensionResponse(BaseModel):
    dimension: str
    points: List[FraudByDimensionPoint]

class FeatureImportanceItem(BaseModel):
    feature_name: str
    importance: float
    rank: int

class FeatureImportanceResponse(BaseModel):
    items: List[FeatureImportanceItem]
    model_version: str
