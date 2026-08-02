"""
Evaluation Module for FraudShield AI ML Pipeline.

Computes metrics (PR-AUC, F1, Recall@90% Precision) and generates
evaluation plots.
"""
import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import (
    auc,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    roc_auc_score,
    roc_curve,
)

logger = logging.getLogger(__name__)

@dataclass
class MetricsReport:
    """Contains evaluation metrics for a model."""
    pr_auc: float
    f1_minority: float
    recall_at_90_precision: float
    roc_auc: float
    confusion_matrix: Dict[str, int]
    classification_report: str
    threshold_used: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "pr_auc": self.pr_auc,
            "f1_minority": self.f1_minority,
            "recall_at_90_precision": self.recall_at_90_precision,
            "roc_auc": self.roc_auc,
            "confusion_matrix": self.confusion_matrix,
            "classification_report": self.classification_report,
            "threshold_used": self.threshold_used,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)

class ModelEvaluator:
    """Evaluates ML models and generates metrics and plots."""

    def compute_all_metrics(
        self, y_true: np.ndarray, y_pred_proba: np.ndarray, threshold: float = 0.5, model_name: str = "model"
    ) -> MetricsReport:
        """Computes comprehensive evaluation metrics."""
        logger.info(f"Computing metrics for {model_name} at threshold {threshold}")
        
        # Hard predictions
        y_pred = (y_pred_proba >= threshold).astype(int)
        
        # PR-AUC
        precision, recall, _ = precision_recall_curve(y_true, y_pred_proba)
        pr_auc_val = auc(recall, precision)
        
        # F1 Score for minority class (fraud = 1)
        f1_min = f1_score(y_true, y_pred, pos_label=1)
        
        # Recall @ 90% Precision
        rec_90 = self._recall_at_precision_threshold(y_true, y_pred_proba, 0.90)
        
        # ROC-AUC
        roc_auc_val = roc_auc_score(y_true, y_pred_proba)
        
        # Confusion Matrix
        cm = confusion_matrix(y_true, y_pred)
        cm_dict = {
            "TN": int(cm[0, 0]),
            "FP": int(cm[0, 1]),
            "FN": int(cm[1, 0]),
            "TP": int(cm[1, 1])
        }
        
        # Classification report
        clf_report = classification_report(y_true, y_pred, target_names=["Legitimate", "Fraud"])
        
        report = MetricsReport(
            pr_auc=pr_auc_val,
            f1_minority=f1_min,
            recall_at_90_precision=rec_90,
            roc_auc=roc_auc_val,
            confusion_matrix=cm_dict,
            classification_report=clf_report,
            threshold_used=threshold
        )
        return report

    def _recall_at_precision_threshold(
        self, y_true: np.ndarray, y_pred_proba: np.ndarray, precision_threshold: float = 0.90
    ) -> float:
        """Finds the maximum recall possible while maintaining precision >= threshold."""
        precisions, recalls, thresholds = precision_recall_curve(y_true, y_pred_proba)
        
        # Find indices where precision meets the threshold
        valid_indices = np.where(precisions >= precision_threshold)[0]
        
        if len(valid_indices) == 0:
            return 0.0
            
        # Maximum recall among the valid indices
        return float(np.max(recalls[valid_indices]))

    def plot_roc_curve(self, y_true: np.ndarray, y_pred_proba: np.ndarray, output_path: str, model_name: str) -> None:
        """Generates and saves the ROC curve."""
        fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
        roc_auc = roc_auc_score(y_true, y_pred_proba)
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, label=f"{model_name} (AUC = {roc_auc:.4f})")
        plt.plot([0, 1], [0, 1], linestyle="--", color="gray", label="Random")
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title(f"ROC Curve - {model_name}")
        plt.legend(loc="lower right")
        plt.grid(alpha=0.3)
        plt.savefig(output_path, bbox_inches="tight")
        plt.close()

    def plot_pr_curve(self, y_true: np.ndarray, y_pred_proba: np.ndarray, output_path: str, model_name: str) -> None:
        """Generates and saves the Precision-Recall curve."""
        precision, recall, _ = precision_recall_curve(y_true, y_pred_proba)
        pr_auc_val = auc(recall, precision)
        
        baseline = np.mean(y_true)
        
        plt.figure(figsize=(8, 6))
        plt.plot(recall, precision, label=f"{model_name} (AUC = {pr_auc_val:.4f})")
        plt.axhline(y=baseline, linestyle="--", color="gray", label=f"Baseline ({baseline:.4f})")
        plt.xlabel("Recall")
        plt.ylabel("Precision")
        plt.title(f"Precision-Recall Curve - {model_name}")
        plt.legend(loc="upper right")
        plt.grid(alpha=0.3)
        plt.savefig(output_path, bbox_inches="tight")
        plt.close()

    def plot_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray, output_path: str, model_name: str) -> None:
        """Generates and saves the confusion matrix heatmap."""
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                    xticklabels=["Legitimate", "Fraud"],
                    yticklabels=["Legitimate", "Fraud"])
        plt.xlabel("Predicted Label")
        plt.ylabel("True Label")
        plt.title(f"Confusion Matrix - {model_name}")
        plt.savefig(output_path, bbox_inches="tight")
        plt.close()
