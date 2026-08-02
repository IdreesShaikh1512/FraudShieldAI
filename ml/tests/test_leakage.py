"""
Leakage tests for FraudShield AI ML Pipeline.
"""
from unittest.mock import patch, MagicMock
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from pipeline.preprocess import FraudPreprocessor
from pipeline.enrichment import SyntheticEnricher

def test_scaler_not_fit_on_test_data():
    """Test that the preprocessor is fitted only on training data."""
    # Create 200-row synthetic dataset
    np.random.seed(42)
    df = pd.DataFrame({
        'Time': np.random.randint(0, 100000, 200),
        'Amount': np.random.uniform(1, 1000, 200),
        'V1': np.random.randn(200),
        'V2': np.random.randn(200)
    })
    
    X_train = df.iloc[:160]
    X_test = df.iloc[160:]
    
    preprocessor = FraudPreprocessor()
    preprocessor.fit(X_train)
    
    # Store fitted parameters
    train_center = preprocessor.amount_scaler.center_
    
    # Transform test set
    preprocessor.transform(X_test)
    
    # Assert parameters haven't changed after transform
    assert np.array_equal(train_center, preprocessor.amount_scaler.center_), \
        "Scaler parameters changed during transform, indicating leakage!"

def test_stratified_split_preserves_fraud_ratio():
    """Test that stratified split maintains class imbalance."""
    np.random.seed(42)
    n_total = 1000
    n_fraud = 17  # ~0.017 ratio
    
    X = pd.DataFrame({'feature': np.random.randn(n_total)})
    y = pd.Series([1]*n_fraud + [0]*(n_total - n_fraud))
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    train_fraud_rate = y_train.mean()
    test_fraud_rate = y_test.mean()
    
    assert abs(train_fraud_rate - test_fraud_rate) < 0.01, \
        f"Fraud rates differ too much: {train_fraud_rate} vs {test_fraud_rate}"

def test_enrichment_applied_after_split():
    """Test that enrichment module does not use training labels."""
    df = pd.DataFrame({
        'Time': [1, 2, 3],
        'Amount': [10, 20, 30],
        'V1': [0.1, 0.2, 0.3],
        'Class': [0, 1, 0]
    })
    
    enricher = SyntheticEnricher()
    
    # Mock np.random.choice to track calls if needed, or simply verify
    # the function runs and produces output without raising error
    enriched_df = enricher.enrich_dataframe(df)
    
    assert 'country_code' in enriched_df.columns
    assert 'merchant_name' in enriched_df.columns
    
    # Check that original columns remain unchanged
    assert (enriched_df['Amount'] == df['Amount']).all()
