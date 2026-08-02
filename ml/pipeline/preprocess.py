"""
Preprocessing Module for FraudShield AI ML Pipeline.

Implements the FraudPreprocessor class which applies necessary scaling
and feature engineering to the raw creditcard dataset.
"""
import logging
from typing import List

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import RobustScaler, StandardScaler

logger = logging.getLogger(__name__)

class FraudPreprocessor(BaseEstimator, TransformerMixin):
    """
    Preprocesses the creditcard.csv dataset for ML training.
    - Uses RobustScaler for 'Amount' (resilient to outliers)
    - Uses StandardScaler for 'Time'
    - Creates 'hour_of_day' feature from 'Time'
    - Passes through V1-V28 unchanged
    """
    
    def __init__(self):
        self.amount_scaler = RobustScaler()
        self.time_scaler = StandardScaler()
        self._is_fitted = False
        self._feature_names = []

    def fit(self, X: pd.DataFrame, y: pd.Series = None) -> 'FraudPreprocessor':
        """
        Fit the preprocessor scalers on the training data.
        
        Args:
            X: Training features dataframe
            y: Ignored, for scikit-learn compatibility
            
        Returns:
            self
        """
        logger.info("Fitting FraudPreprocessor...")
        
        self.amount_scaler.fit(X[['Amount']])
        self.time_scaler.fit(X[['Time']])
        
        # Determine output feature names
        base_features = [col for col in X.columns if col.startswith('V')]
        self._feature_names = ['Time', 'Amount', 'hour_of_day'] + base_features
        
        self._is_fitted = True
        logger.info("FraudPreprocessor fitted successfully.")
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Apply preprocessing transformations to the data.
        
        Args:
            X: Features dataframe to transform
            
        Returns:
            Transformed dataframe
            
        Raises:
            RuntimeError: If called before fit()
        """
        if not self._is_fitted:
            raise RuntimeError("FraudPreprocessor must be fitted before calling transform().")
            
        logger.debug(f"Transforming dataset of shape {X.shape}")
        
        X_out = X.copy()
        
        # Scale continuous features
        X_out['Amount'] = self.amount_scaler.transform(X[['Amount']])
        X_out['Time_scaled'] = self.time_scaler.transform(X[['Time']])
        
        # Feature Engineering: hour of day
        # Assuming Time is in seconds since first transaction
        X_out['hour_of_day'] = (X['Time'] % 86400) / 3600.0
        
        # Reorder and rename
        X_out['Time'] = X_out['Time_scaled']
        
        # V features passthrough
        v_cols = [col for col in X.columns if col.startswith('V')]
        
        final_cols = ['Time', 'Amount', 'hour_of_day'] + v_cols
        return X_out[final_cols]
        
    def fit_transform(self, X: pd.DataFrame, y: pd.Series = None) -> pd.DataFrame:
        """Fit the preprocessor and then transform the data."""
        return self.fit(X, y).transform(X)

    @property
    def feature_names(self) -> List[str]:
        """Returns the list of output feature names."""
        if not self._is_fitted:
            raise RuntimeError("FraudPreprocessor must be fitted to get feature names.")
        return self._feature_names
        
    def save(self, path: str) -> None:
        """Save the fitted preprocessor to disk."""
        if not self._is_fitted:
            raise RuntimeError("Cannot save an unfitted FraudPreprocessor.")
        joblib.dump(self, path)
        logger.info(f"FraudPreprocessor saved to {path}")
        
    @classmethod
    def load(cls, path: str) -> 'FraudPreprocessor':
        """Load a fitted preprocessor from disk."""
        preprocessor = joblib.load(path)
        logger.info(f"FraudPreprocessor loaded from {path}")
        return preprocessor
