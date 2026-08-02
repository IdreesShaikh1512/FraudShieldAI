"""
Pipeline Orchestrator for FraudShield AI.

Runs the complete ML pipeline: validation, preprocessing, model training,
evaluation, SHAP explainer generation, and synthetic enrichment.
"""
import argparse
import json
import logging
import os
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

from validate import DataValidator
from preprocess import FraudPreprocessor
from train_logreg import LogisticRegressionTrainer
from train_isoforest import IsolationForestTrainer
from evaluate import ModelEvaluator
from explain import SHAPExplainer
from enrichment import SyntheticEnricher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Run FraudShield AI ML Pipeline")
    parser.add_argument("--data-path", type=str, required=True, help="Path to creditcard.csv")
    parser.add_argument("--output-dir", type=str, default="ml/models/", help="Output directory")
    parser.add_argument("--version", type=str, default=None, help="Model version tag (default: timestamp)")
    
    args = parser.parse_args()
    
    data_path = Path(args.data_path)
    output_dir = Path(args.output_dir)
    version = args.version or datetime.now().strftime("%Y%m%d_%H%M%S")
    version_dir = output_dir / f"v{version}"
    plots_dir = version_dir / "plots"
    
    version_dir.mkdir(parents=True, exist_ok=True)
    plots_dir.mkdir(exist_ok=True)
    
    # 1. Validation
    validator = DataValidator()
    try:
        report = validator.validate(data_path)
        logger.info(f"Validation successful. Dataset Hash: {report.dataset_hash[:8]}")
    except Exception as e:
        logger.error(f"Validation failed: {str(e)}")
        raise
        
    # 2. Load and Split
    logger.info("Loading dataset and splitting...")
    df = pd.read_csv(data_path)
    
    X = df.drop(columns=["Class"])
    y = df["Class"]
    
    # Stratified split to preserve class imbalance
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    logger.info(f"Train size: {len(X_train)} (Fraud: {y_train.sum()})")
    logger.info(f"Test size: {len(X_test)} (Fraud: {y_test.sum()})")
    
    # 3. Preprocess
    preprocessor = FraudPreprocessor()
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)
    
    preprocessor.save(str(version_dir / "scaler.joblib"))
    
    # 4. Train LogReg
    logreg_trainer = LogisticRegressionTrainer()
    model_logreg, cv_results, best_params = logreg_trainer.train(X_train_proc, y_train)
    logreg_path = logreg_trainer.save(model_logreg, str(version_dir), version)
    
    # 5. Train IsoForest (Unsupervised)
    isoforest_trainer = IsolationForestTrainer()
    model_isoforest = isoforest_trainer.train(X_train_proc)
    isoforest_path = isoforest_trainer.save(model_isoforest, str(version_dir), version)
    
    # 6. Evaluate
    evaluator = ModelEvaluator()
    
    # LogReg Evaluation
    y_pred_proba_logreg = model_logreg.predict_proba(X_test_proc)[:, 1]
    metrics_logreg = evaluator.compute_all_metrics(y_test.values, y_pred_proba_logreg, threshold=0.5, model_name="LogReg")
    
    with open(version_dir / "metrics_logreg.json", "w") as f:
        f.write(metrics_logreg.to_json())
        
    evaluator.plot_roc_curve(y_test.values, y_pred_proba_logreg, str(plots_dir / "roc_logreg.png"), "Logistic Regression")
    evaluator.plot_pr_curve(y_test.values, y_pred_proba_logreg, str(plots_dir / "pr_logreg.png"), "Logistic Regression")
    y_pred_logreg = (y_pred_proba_logreg >= 0.5).astype(int)
    evaluator.plot_confusion_matrix(y_test.values, y_pred_logreg, str(plots_dir / "cm_logreg.png"), "Logistic Regression")
    
    # IsoForest Evaluation
    scores_iso = model_isoforest.decision_function(X_test_proc)
    y_pred_proba_iso = isoforest_trainer.score_to_proba(scores_iso)
    # Determine threshold based on contamination
    iso_threshold = np.percentile(y_pred_proba_iso, 100 * (1 - 0.00172))
    metrics_iso = evaluator.compute_all_metrics(y_test.values, y_pred_proba_iso, threshold=iso_threshold, model_name="IsoForest")
    
    with open(version_dir / "metrics_isoforest.json", "w") as f:
        f.write(metrics_iso.to_json())
        
    evaluator.plot_roc_curve(y_test.values, y_pred_proba_iso, str(plots_dir / "roc_isoforest.png"), "Isolation Forest")
    evaluator.plot_pr_curve(y_test.values, y_pred_proba_iso, str(plots_dir / "pr_isoforest.png"), "Isolation Forest")
    
    # 7. SHAP Explainers
    shap_explainer = SHAPExplainer()
    X_train_sample = shap.sample(X_train_proc, 100)
    
    explainer_logreg = shap_explainer.build_explainer(model_logreg, X_train_sample, 'logreg')
    shap_explainer.save(explainer_logreg, str(version_dir / "shap_logreg.joblib"))
    shap_explainer.plot_summary(explainer_logreg, X_train_sample, preprocessor.feature_names, str(plots_dir / "shap_summary_logreg.png"))
    
    explainer_iso = shap_explainer.build_explainer(model_isoforest, X_train_sample, 'isoforest')
    shap_explainer.save(explainer_iso, str(version_dir / "shap_isoforest.joblib"))
    
    # 8. Synthetic Enrichment (AFTER TRAINING)
    logger.info("Applying synthetic enrichment to dataset for UI demo...")
    enricher = SyntheticEnricher()
    # Enrich the test set as an example output
    df_test_enriched = df.loc[X_test.index].copy()
    df_test_enriched = enricher.enrich_dataframe(df_test_enriched)
    
    # 9. Model Registry Entry
    registry_entry = {
        "version": version,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "dataset_hash": report.dataset_hash,
        "models": {
            "logistic_regression": {
                "path": str(logreg_path),
                "metrics": metrics_logreg.to_dict()
            },
            "isolation_forest": {
                "path": str(isoforest_path),
                "metrics": metrics_iso.to_dict()
            }
        },
        "artifacts": {
            "scaler": str(version_dir / "scaler.joblib"),
            "shap_logreg": str(version_dir / "shap_logreg.joblib"),
            "shap_isoforest": str(version_dir / "shap_isoforest.joblib")
        }
    }
    
    with open(version_dir / "model_registry_entry.json", "w") as f:
        json.dump(registry_entry, f, indent=2)
        
    logger.info(f"Pipeline completed successfully. All artifacts saved to {version_dir}")
    
if __name__ == '__main__':
    main()
