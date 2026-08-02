export type UserRole = 'admin' | 'analyst' | 'auditor'
export type RiskTier = 'low' | 'medium' | 'high' | 'critical'
export type BatchJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface User { id: string; email: string; full_name: string; role: UserRole; is_active: boolean; created_at: string; last_login_at: string | null }
export interface SHAPFeature { feature_name: string; value: number; shap_value: number; contribution_pct: number }
export interface Prediction { id: string; transaction_id: string; risk_score: number; risk_tier: RiskTier; is_fraud_predicted: boolean; explanation: SHAPFeature[]; model_version: string; created_at: string; confidence_pct: number; analyst_override: boolean }
export interface Transaction { id: string; amount: number; txn_time: string; merchant_name: string; merchant_category: string; country_code: string; card_last4: string; device_type: string }
export interface PredictionHistoryItem extends Prediction { amount: number; country_code: string; merchant_name: string }
export interface BatchJobResponse { job_id: string; status: BatchJobStatus; total_rows: number; processed_rows: number; download_url: string | null; error_message: string | null }
export interface KPIData { total_transactions: number; total_fraud: number; fraud_rate: number; avg_risk_score: number; active_model_version: string; period_label: string }
export interface ROCPoint { fpr: number; tpr: number; threshold: number }
export interface ROCData { points: ROCPoint[]; auc: number; model_version: string }
export interface PRPoint { precision: number; recall: number; threshold: number }
export interface PRData { points: PRPoint[]; auc: number; baseline: number; model_version: string }
export interface ConfusionMatrixData { tp: number; tn: number; fp: number; fn: number; accuracy: number; precision: number; recall: number; f1: number }
export interface FraudByHourPoint { hour: number; total: number; fraud: number; fraud_rate: number }
export interface FraudByDimensionPoint { label: string; total: number; fraud: number; fraud_rate: number }
export interface FeatureImportanceItem { feature_name: string; importance: number; rank: number }
export interface ModelVersion { id: string; model_name: string; version: string; trained_at: string; pr_auc: number; f1_minority: number; recall_at_90p: number; roc_auc: number; is_active: boolean; notes: string }
export interface AuditLog { id: string; user_id: string; action: string; resource_type: string; resource_id: string; metadata: Record<string,unknown>; ip_address: string; created_at: string }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; limit: number; pages: number }
export interface ApiError { detail: string; code?: string }
export interface TransactionInput { amount: number; time: number; v1: number; v2: number; v3: number; v4: number; v5: number; v6: number; v7: number; v8: number; v9: number; v10: number; v11: number; v12: number; v13: number; v14: number; v15: number; v16: number; v17: number; v18: number; v19: number; v20: number; v21: number; v22: number; v23: number; v24: number; v25: number; v26: number; v27: number; v28: number }
