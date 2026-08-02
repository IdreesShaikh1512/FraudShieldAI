"""
Logistic Regression Training Module for FraudShield AI ML Pipeline.

Implements LogisticRegressionTrainer for training a supervised primary
model handling class imbalance via class_weight and GridSearchCV.
"""
import logging
import os
from typing import Tuple

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

class LogisticRegressionTrainer:
    """
    Trains a Logistic Regression model to detect fraud.
    Optimizes for Area Under the Precision-Recall Curve (average_precision)
    using StratifiedKFold cross-validation.
    """
    def __init__(self):
        self.model = None
        self.best_params = None
        self.cv_results = None

    def train(self, X_train: pd.DataFrame, y_train: pd.Series) -> Tuple[LogisticRegression, pd.DataFrame, dict]:
        """
        Train the model using GridSearchCV.

        Args:
            X_train: Training features
            y_train: Training labels (0=Legit, 1=Fraud)
            
        Returns:
            Tuple of (best_model, cv_results_dataframe, best_parameters)
        """
        logger.info("Starting Logistic Regression training via GridSearchCV...")
        
        # Grid definition
        param_grid = {
            'C': [0.001, 0.01, 0.1, 1, 10],
            'penalty': ['l1', 'l2'],
            'solver': ['liblinear'],
            'class_weight': ['balanced'],
            'random_state': [42]
        }
        
        base_model = LogisticRegression(max_iter=1000)
        
        # Cross validation setup
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        
        grid_search = GridSearchCV(
            estimator=base_model,
            param_grid=param_grid,
            cv=cv,
            scoring='average_precision',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        self.model = grid_search.best_estimator_
        self.best_params = grid_search.best_params_
        self.cv_results = pd.DataFrame(grid_search.cv_results_)
        
        logger.info(f"Best parameters found: {self.best_params}")
        logger.info(f"Best PR-AUC score from CV: {grid_search.best_score_:.4f}")
        
        # Log all fold scores for best estimator
        best_index = grid_search.best_index_
        for i in range(5):
            fold_score = self.cv_results.loc[best_index, f'split{i}_test_score']
            logger.info(f"Fold {i+1} score: {fold_score:.4f}")
            
        return self.model, self.cv_results, self.best_params

    def save(self, model: LogisticRegression, output_dir: str, version: str) -> str:
        """
        Save the trained model to disk.

        Args:
            model: Fitted LogisticRegression model
            output_dir: Directory to save the model
            version: Model version tag
            
        Returns:
            File path of the saved model
        """
        os.makedirs(output_dir, exist_ok=True)
        filename = f"model_logreg_{version}.joblib"
        filepath = os.path.join(output_dir, filename)
        
        joblib.dump(model, filepath)
        logger.info(f"Logistic Regression model saved to {filepath}")
        return filepath
