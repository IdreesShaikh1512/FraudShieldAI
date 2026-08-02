"""
Metrics tests for FraudShield AI ML Pipeline.
"""
import json
import numpy as np
import pytest

from pipeline.evaluate import ModelEvaluator, MetricsReport

def test_pr_auc_meaningful():
    """Test PR-AUC is 1.0 for perfect classifier."""
    y_true = np.array([0, 0, 1, 1])
    y_pred_proba = np.array([0.1, 0.2, 0.9, 0.95])
    
    evaluator = ModelEvaluator()
    report = evaluator.compute_all_metrics(y_true, y_pred_proba)
    
    assert np.isclose(report.pr_auc, 1.0)

def test_recall_at_precision_90():
    """Verify Recall@90% computation."""
    y_true = np.array([0, 0, 0, 1, 1, 1, 1])
    # TPs: last 3 (idx 4,5,6), FP: idx 2
    # At proba >= 0.8: TP=3, FP=0 -> Prec=1.0, Rec=0.75
    # At proba >= 0.6: TP=4, FP=1 -> Prec=0.8, Rec=1.0
    y_pred_proba = np.array([0.1, 0.2, 0.7, 0.6, 0.8, 0.9, 0.95])
    
    evaluator = ModelEvaluator()
    rec_90 = evaluator._recall_at_precision_threshold(y_true, y_pred_proba, 0.90)
    
    # Expecting 0.75 since precision hits 1.0 at threshold 0.8
    assert np.isclose(rec_90, 0.75)

def test_f1_minority_class():
    """Assert F1 computed on class=1."""
    y_true = np.array([0, 0, 1, 1])
    y_pred_proba = np.array([0.9, 0.1, 0.9, 0.1]) 
    # Preds: [1, 0, 1, 0]
    # Class 1: TP=1, FP=1, FN=1 -> F1 = 2*1 / (2*1 + 1 + 1) = 0.5
    # Class 0: TN=1, FN=1, FP=1 -> F1 = 0.5
    
    evaluator = ModelEvaluator()
    report = evaluator.compute_all_metrics(y_true, y_pred_proba, threshold=0.5)
    
    assert np.isclose(report.f1_minority, 0.5)

def test_metrics_report_json_serializable():
    """Assert JSON serialization works for report."""
    report = MetricsReport(
        pr_auc=0.9,
        f1_minority=0.8,
        recall_at_90_precision=0.7,
        roc_auc=0.95,
        confusion_matrix={"TP": 10, "FP": 2, "TN": 100, "FN": 5},
        classification_report="text",
        threshold_used=0.5
    )
    
    json_str = report.to_json()
    parsed = json.loads(json_str)
    
    assert parsed["pr_auc"] == 0.9
    assert parsed["confusion_matrix"]["TP"] == 10

def test_confusion_matrix_sums_correctly():
    """TP+TN+FP+FN = total samples."""
    y_true = np.array([0, 0, 1, 1, 0, 0, 1])
    y_pred_proba = np.array([0.1, 0.9, 0.8, 0.4, 0.2, 0.3, 0.7])
    
    evaluator = ModelEvaluator()
    report = evaluator.compute_all_metrics(y_true, y_pred_proba)
    
    cm = report.confusion_matrix
    total = cm["TP"] + cm["TN"] + cm["FP"] + cm["FN"]
    
    assert total == len(y_true)
