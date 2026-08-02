"""
Explainability Module for FraudShield AI ML Pipeline.

Builds SHAP explainers for both LogReg and Isolation Forest to provide
feature attribution globally and locally.
"""
import logging
from typing import Any, Dict, List

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap

logger = logging.getLogger(__name__)

class SHAPExplainer:
    """Builds and queries SHAP explainers for FraudShield models."""

    def build_explainer(self, model: Any, X_train_sample: pd.DataFrame, model_type: str) -> shap.Explainer:
        """
        Builds the appropriate SHAP explainer based on model type.
        
        Args:
            model: Fitted model
            X_train_sample: Background dataset (e.g., K-Means summary or random sample)
            model_type: 'logreg' or 'isoforest'
            
        Returns:
            Fitted SHAP explainer
        """
        logger.info(f"Building SHAP explainer for {model_type}...")
        
        if model_type == 'logreg':
            # LinearExplainer for Logistic Regression
            explainer = shap.LinearExplainer(model, X_train_sample)
        elif model_type == 'isoforest':
            # TreeExplainer for Isolation Forest
            explainer = shap.TreeExplainer(model)
        else:
            raise ValueError(f"Unknown model_type: {model_type}")
            
        logger.info("SHAP explainer built successfully.")
        return explainer

    def get_local_explanation(self, explainer: shap.Explainer, instance: pd.DataFrame, feature_names: List[str]) -> List[Dict[str, Any]]:
        """
        Gets the top 5 feature contributions for a single instance.
        
        Args:
            explainer: Fitted SHAP explainer
            instance: 1-row DataFrame of features
            feature_names: List of feature names
            
        Returns:
            List of top 5 feature contributions.
        """
        shap_values = explainer.shap_values(instance)
        
        # Handle formats from different explainers (lists vs arrays)
        if isinstance(shap_values, list):
            # For classification, we care about the positive class (class 1)
            vals = shap_values[1][0]
        else:
            vals = shap_values[0]
            
        abs_vals = np.abs(vals)
        total_abs_contrib = np.sum(abs_vals)
        
        # Get top 5 indices
        top_indices = np.argsort(abs_vals)[-5:][::-1]
        
        explanation = []
        for idx in top_indices:
            feat_name = feature_names[idx]
            feat_val = instance.iloc[0, idx]
            shap_val = vals[idx]
            pct = (abs_vals[idx] / total_abs_contrib * 100) if total_abs_contrib > 0 else 0
            
            explanation.append({
                "feature_name": feat_name,
                "value": float(feat_val),
                "shap_value": float(shap_val),
                "contribution_pct": float(pct)
            })
            
        return explanation

    def get_global_importance(self, explainer: shap.Explainer, X_sample: pd.DataFrame, feature_names: List[str]) -> List[Dict[str, Any]]:
        """
        Gets global feature importance ranked by mean absolute SHAP value.
        """
        shap_values = explainer.shap_values(X_sample)
        
        if isinstance(shap_values, list):
            vals = shap_values[1]
        else:
            vals = shap_values
            
        mean_abs_shap = np.abs(vals).mean(axis=0)
        
        # Sort indices by importance
        sorted_indices = np.argsort(mean_abs_shap)[::-1]
        
        importance = []
        for rank, idx in enumerate(sorted_indices, 1):
            importance.append({
                "feature_name": feature_names[idx],
                "mean_abs_shap": float(mean_abs_shap[idx]),
                "rank": rank
            })
            
        return importance

    def plot_summary(self, explainer: shap.Explainer, X_sample: pd.DataFrame, feature_names: List[str], output_path: str) -> None:
        """Saves a SHAP summary bar chart."""
        shap_values = explainer.shap_values(X_sample)
        
        if isinstance(shap_values, list):
            vals = shap_values[1]
        else:
            vals = shap_values
            
        plt.figure(figsize=(10, 8))
        shap.summary_plot(vals, X_sample, feature_names=feature_names, plot_type="bar", show=False)
        plt.savefig(output_path, bbox_inches="tight")
        plt.close()

    def save(self, explainer: shap.Explainer, path: str) -> None:
        joblib.dump(explainer, path)
        logger.info(f"SHAP explainer saved to {path}")

    @classmethod
    def load(cls, path: str) -> shap.Explainer:
        return joblib.load(path)
