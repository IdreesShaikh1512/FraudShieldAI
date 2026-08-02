"""
Demo Data Generator for FraudShield AI.

Generates 500 synthetic transactions with realistic features and enrichment,
plus demo users. Outputs to JSON files for the backend API seed endpoints.
"""
import json
import os
import uuid
from datetime import datetime

import numpy as np
import pandas as pd

from preprocess import FraudPreprocessor
from enrichment import SyntheticEnricher

def generate_demo_transactions(output_path: str):
    """Generate 500 demo transactions (10% fraud)."""
    np.random.seed(42)
    n_total = 500
    n_fraud = 50
    n_legit = n_total - n_fraud
    
    # Generate base features (Time, Amount, V1-V28)
    times = np.random.randint(0, 172800, size=n_total)
    
    # Legit amounts (log-normal approx)
    legit_amounts = np.random.lognormal(mean=3.0, sigma=1.0, size=n_legit)
    # Fraud amounts (often small tests or very large, we'll use a mixed dist)
    fraud_amounts = np.concatenate([
        np.random.uniform(0.1, 5.0, size=20),
        np.random.uniform(200, 2000, size=30)
    ])
    amounts = np.concatenate([legit_amounts, fraud_amounts])
    
    classes = np.concatenate([np.zeros(n_legit), np.ones(n_fraud)])
    
    # Shuffle
    idx = np.random.permutation(n_total)
    times = times[idx]
    amounts = amounts[idx]
    classes = classes[idx]
    
    # Generate V1-V28
    v_cols = [f"V{i}" for i in range(1, 29)]
    df_data = {"Time": times, "Amount": amounts, "Class": classes}
    
    for v in v_cols:
        # Standard normal for most
        legit_v = np.random.normal(0, 1, size=n_legit)
        if v in ["V1", "V2", "V3", "V4", "V5"]:
            # Shifted for fraud to simulate signal
            fraud_v = np.random.normal(-3 if v in ["V1", "V3"] else 2, 1.5, size=n_fraud)
        else:
            fraud_v = np.random.normal(0, 1, size=n_fraud)
            
        v_vals = np.concatenate([legit_v, fraud_v])[idx]
        df_data[v] = v_vals
        
    df = pd.DataFrame(df_data)
    
    # Preprocess
    preprocessor = FraudPreprocessor()
    X_processed = preprocessor.fit_transform(df.drop(columns=["Class"]))
    
    # Add enrichment
    enricher = SyntheticEnricher()
    df_enriched = enricher.enrich_dataframe(df, random_state=42)
    
    transactions = []
    
    for i in range(n_total):
        # Simulate simple prediction logic based on shifted V1/Amount
        # Real pipeline uses actual models; here we just simulate for demo data
        row = df.iloc[i]
        is_fraud = row["Class"] == 1
        
        prob = 0.95 if is_fraud else 0.02
        pred_class = 1 if prob > 0.5 else 0
        
        txn_id = str(uuid.uuid4())
        
        # Build API-compatible JSON
        txn = {
            "transaction_id": txn_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "amount": float(row["Amount"]),
            "time_seconds": float(row["Time"]),
            # Enrichment fields
            "merchant_name": str(df_enriched.iloc[i]["merchant_name"]),
            "merchant_category": str(df_enriched.iloc[i]["merchant_category"]),
            "country_code": str(df_enriched.iloc[i]["country_code"]),
            "device_type": str(df_enriched.iloc[i]["device_type"]),
            "card_last4": str(df_enriched.iloc[i]["card_last4"]),
            # Pre-computed model results
            "is_fraud": bool(pred_class == 1),
            "fraud_probability": float(prob),
            # Keep V features flat or nested depending on API, assuming flat here for simplicity
        }
        for v in v_cols:
            txn[v] = float(row[v])
            
        transactions.append(txn)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(transactions, f, indent=2)
        
    print(f"Generated {n_total} demo transactions to {output_path}")

def generate_demo_users(output_path: str):
    """Generate demo users."""
    users = [
        {"email": "admin@fraudshield.ai", "password": "Admin@123456", "role": "admin"},
        {"email": "analyst@fraudshield.ai", "password": "Analyst@123456", "role": "analyst"},
        {"email": "auditor@fraudshield.ai", "password": "Auditor@123456", "role": "auditor"}
    ]
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(users, f, indent=2)
        
    print(f"Generated 3 demo users to {output_path}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    demo_dir = os.path.join(base_dir, "data", "demo")
    
    generate_demo_transactions(os.path.join(demo_dir, "demo_transactions.json"))
    generate_demo_users(os.path.join(demo_dir, "demo_users.json"))
