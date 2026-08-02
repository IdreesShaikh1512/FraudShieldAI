import joblib
import json
import os
import glob
import numpy as np
from app.core.config import get_settings
from app.ml.shap_wrapper import SHAPWrapper

settings = get_settings()

class MLInferenceService:
    def __init__(self):
        self._models_loaded = False
        self.model_dir = settings.MODEL_DIR
        self.logreg = None
        self.isoforest = None
        self.scaler = None
        self.shap_explainer = None
        self.metrics = None
        self.version = "v1.0.0-demo"
        self.load_models()

    def load_models(self):
        try:
            if not os.path.exists(self.model_dir):
                return
                
            versions = sorted(glob.glob(os.path.join(self.model_dir, 'v*')), reverse=True)
            if not versions:
                return
                
            latest = versions[0]
            self.version = os.path.basename(latest)
            
            self.logreg = joblib.load(os.path.join(latest, 'model_logreg_resampled.joblib'))
            self.isoforest = joblib.load(os.path.join(latest, 'model_isoforest.joblib'))
            self.scaler = joblib.load(os.path.join(latest, 'scaler.joblib'))
            self.shap_explainer = joblib.load(os.path.join(latest, 'shap_logreg.joblib'))
            
            with open(os.path.join(latest, 'metrics_logreg.json'), 'r') as f:
                self.metrics = json.load(f)
                
            self._models_loaded = True
        except Exception as e:
            print(f"Error loading models: {e}")
            self._models_loaded = False

    def predict(self, features: dict) -> dict:
        feature_names = ['Time', 'Amount'] + [f'V{i}' for i in range(1, 29)]
        
        if not self._models_loaded:
            # Demo prediction based on amount
            amt = features.get('amount', 0)
            risk = min(0.99, max(0.01, amt / 10000.0))
            if amt % 2 == 0:
                risk += 0.2
            risk_tier = 'critical' if risk > 0.85 else 'high' if risk > 0.6 else 'medium' if risk > 0.3 else 'low'
            return {
                'risk_score': risk,
                'risk_tier': risk_tier,
                'is_fraud_predicted': risk > 0.85,
                'explanation': [{'feature_name': 'Amount', 'value': amt, 'shap_value': 1.5, 'contribution_pct': 90.0}],
                'model_version': self.version
            }

        input_arr = np.zeros((1, 30))
        input_arr[0, 0] = features.get('time', features.get('Time', 0))
        input_arr[0, 1] = features.get('amount', features.get('Amount', 0))
        for i in range(1, 29):
            key = f'v{i}'
            input_arr[0, i+1] = features.get(key, features.get(key.upper(), 0))
            
        scaled_input = input_arr.copy()
        scaled_input[:, :2] = self.scaler.transform(input_arr[:, :2])
        
        logreg_proba = self.logreg.predict_proba(scaled_input)[0, 1]
        if_score_raw = self.isoforest.decision_function(scaled_input)[0]
        # Normalize if_score to 0-1
        if_score = 1.0 - (1.0 / (1.0 + np.exp(-if_score_raw * -1)))
        
        combined_score = 0.7 * logreg_proba + 0.3 * if_score
        
        risk_tier = 'critical' if combined_score > 0.85 else 'high' if combined_score > 0.6 else 'medium' if combined_score > 0.3 else 'low'
        
        explanation = SHAPWrapper.get_local_explanation(self.shap_explainer, scaled_input, feature_names)
        
        return {
            'risk_score': float(combined_score),
            'risk_tier': risk_tier,
            'is_fraud_predicted': combined_score > 0.85,
            'explanation': explanation,
            'model_version': self.version
        }

    def get_feature_importance(self):
        if not self._models_loaded:
            return [{'feature_name': 'V14', 'importance': 0.8, 'rank': 1}]
        # Placeholder for global importance
        return [{'feature_name': 'V14', 'importance': 0.8, 'rank': 1}]

    def get_metrics(self):
        return self.metrics

    @property
    def is_loaded(self) -> bool:
        return self._models_loaded

ml_service = MLInferenceService()
