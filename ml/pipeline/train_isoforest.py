"""
Isolation Forest Training Module for FraudShield AI ML Pipeline.

Implements IsolationForestTrainer for training an unsupervised secondary
anomaly detection model. Labels are NOT used during training.
"""
import logging
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

class IsolationForestTrainer:
    """
    Trains an Isolation Forest model for unsupervised fraud detection.
    
    This acts as a secondary signal, explicitly ignoring labels during training.
    """
    def __init__(self):
        self.model = None

    def train(self, X_train: pd.DataFrame) -> IsolationForest:
        """
        Train the Isolation Forest on the training data.
        
        Args:
            X_train: Training features only. NO LABELS ARE PASSED.
            
        Returns:
            Trained IsolationForest model
        """
        logger.info("Starting Isolation Forest unsupervised training...")
        
        # 0.00172 is the approximate known fraud prevalence in the dataset
        self.model = IsolationForest(
            n_estimators=200,
            contamination=0.00172,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train)
        logger.info("Isolation Forest training complete.")
        
        return self.model

    def score_to_proba(self, scores: np.ndarray) -> np.ndarray:
        """
        Converts raw anomaly scores to a probability-like [0, 1] range.
        
        scikit-learn's Isolation Forest returns negative scores for anomalies
        and positive scores for normal instances. The lower the score, the more
        abnormal. We invert and normalize this so higher = more likely fraud (closer to 1).
        
        Args:
            scores: Raw scores from decision_function
            
        Returns:
            Normalized scores in [0, 1]
        """
        # Isolation Forest decision_function range is roughly [-0.5, 0.5]
        # Invert so positive means anomaly
        inverted = -scores
        
        # Min-max scaling as a rough proxy for probabilities
        # A more robust method could involve Platt scaling on a validation set,
        # but this simple normalization works for an unsupervised secondary signal.
        min_score = np.min(inverted)
        max_score = np.max(inverted)
        
        if max_score > min_score:
            proba = (inverted - min_score) / (max_score - min_score)
        else:
            proba = np.zeros_like(inverted)
            
        return proba

    def save(self, model: IsolationForest, output_dir: str, version: str) -> str:
        """
        Save the trained model to disk.

        Args:
            model: Fitted IsolationForest model
            output_dir: Directory to save the model
            version: Model version tag
            
        Returns:
            File path of the saved model
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = f"model_isoforest_{version}.joblib"
        filepath = os.path.join(output_dir, filename)
        
        joblib.dump(model, filepath)
        logger.info(f"Isolation Forest model saved to {filepath}")
        return filepath
