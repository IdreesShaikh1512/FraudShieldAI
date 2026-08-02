"""
Pipeline tests for FraudShield AI ML Pipeline.
"""
import numpy as np
import pandas as pd
import pytest

from pipeline.preprocess import FraudPreprocessor
from pipeline.train_logreg import LogisticRegressionTrainer
from pipeline.train_isoforest import IsolationForestTrainer
from pipeline.explain import SHAPExplainer
from pipeline.enrichment import SyntheticEnricher

def test_preprocessor_fit_only_on_train():
    """Assert scaler parameters are set after fit."""
    df = pd.DataFrame({
        'Time': [1, 2, 3],
        'Amount': [10, 20, 30],
        'V1': [0.1, 0.2, 0.3]
    })
    
    preprocessor = FraudPreprocessor()
    assert not hasattr(preprocessor.amount_scaler, 'scale_')
    
    preprocessor.fit(df)
    assert hasattr(preprocessor.amount_scaler, 'scale_')
    assert preprocessor._is_fitted is True

def test_preprocessor_transform_before_fit_raises():
    """Assert RuntimeError if transform called before fit."""
    df = pd.DataFrame({'Time': [1], 'Amount': [10]})
    preprocessor = FraudPreprocessor()
    
    with pytest.raises(RuntimeError):
        preprocessor.transform(df)

def test_logreg_trainer_returns_model():
    """Small synthetic data, assert predict_proba works."""
    X_train = pd.DataFrame({'f1': [1, 2, 1, 2], 'f2': [1, 1, 2, 2]})
    y_train = pd.Series([0, 0, 1, 1])
    
    trainer = LogisticRegressionTrainer()
    model, _, _ = trainer.train(X_train, y_train)
    
    preds = model.predict_proba(X_train)
    assert preds.shape == (4, 2)

def test_isoforest_trainer_no_labels():
    """Assert train() only takes X_train (unsupervised)."""
    X_train = pd.DataFrame({'f1': [1, 2, 3, 4], 'f2': [1, 1, 2, 2]})
    
    trainer = IsolationForestTrainer()
    model = trainer.train(X_train)
    
    # Should work without labels
    scores = model.decision_function(X_train)
    assert len(scores) == 4

def test_enrichment_deterministic():
    """Same random_state produces same country."""
    df = pd.DataFrame({'Amount': [10, 20]})
    
    enricher = SyntheticEnricher()
    out1 = enricher.enrich_dataframe(df, random_state=42)
    out2 = enricher.enrich_dataframe(df, random_state=42)
    
    assert out1['country_code'].tolist() == out2['country_code'].tolist()
