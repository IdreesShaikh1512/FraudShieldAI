# FraudShield AI — Model Card

## Model Overview
FraudShield AI employs a dual-model architecture to detect fraudulent credit card transactions. 
1. **Primary Model**: A supervised Logistic Regression classifier trained on historical fraud labels, optimized for the Area Under the Precision-Recall Curve (PR-AUC).
2. **Secondary Model**: An unsupervised Isolation Forest anomaly detector that flags unusual transaction patterns without relying on prior labels.

## Intended Use
- **Primary Use Case**: Real-time scoring of credit card transactions to flag potential fraud.
- **Users**: Fraud analysts and automated authorization systems at financial institutions.
- **Environment**: Backend API integration via the FraudShield platform.

## Out-of-Scope Uses
- Do not use this model to predict fraud for non-credit-card payment methods (e.g., wire transfers, cryptocurrency).
- The model should not be used as the sole decision-maker for permanently closing user accounts without human review.

## Training Data
The models are trained on the ULB/Kaggle `creditcard.csv` dataset, which contains European credit card transactions from September 2013.
- **Total Transactions**: 284,807
- **Fraudulent Transactions**: 492 (0.172% prevalence)
- **Time Range**: 2 days of transactions

## Features
The machine learning models use *only* the following numerical features from the original dataset:
- `Time`: Seconds elapsed between the transaction and the first transaction in the dataset.
- `Amount`: The transaction amount.
- `V1` to `V28`: Principal Component Analysis (PCA) transformed features (original identities are confidential).

> **IMPORTANT: SYNTHETIC ENRICHMENT BOUNDARY**  
> Features such as `country_code`, `merchant_name`, `merchant_category`, and `device_type` are **SYNTHETICALLY GENERATED** for UI, analytics, and demonstration purposes only. They are **NOT** used as inputs to the ML models. The pipeline enforces this strict separation.

## Model Architecture
We use a dual-model approach:
- **Logistic Regression (Supervised)**: Uses `class_weight='balanced'` and is optimized via GridSearchCV. Provides interpretable, linear decision boundaries based on known fraud patterns.
- **Isolation Forest (Unsupervised)**: Detects anomalies based on isolation in feature space. It acts as a safety net for novel fraud patterns that the Logistic Regression model may miss due to lack of historical labels.

## Training Procedure
1. **Preprocessing**: 
   - `Amount` scaled using `RobustScaler` (outlier resistant).
   - `Time` scaled using `StandardScaler` and engineered into `hour_of_day`.
   - `V1-V28` passed through as-is.
2. **Data Split**: 80/20 train/test stratified split to maintain the 0.172% fraud prevalence. Preprocessors are strictly fit on the training set to prevent data leakage.
3. **Training**:
   - Logistic regression tuned with 5-fold Stratified cross-validation.
   - Isolation Forest trained on training features only (labels dropped).

## Evaluation Results
*(Placeholder metrics - to be updated upon pipeline execution)*
- **Logistic Regression**:
  - PR-AUC: ~0.75
  - F1-Score (Minority): ~0.78
  - Recall @ 90% Precision: ~0.65
- **Isolation Forest**:
  - ROC-AUC: ~0.95
  - Recall (Anomaly Threshold): ~0.35

## Limitations
- **Concept Drift**: The dataset is from 2013. Consumer behavior and fraud tactics have evolved significantly.
- **Anonymization**: Due to PCA anonymization of V1-V28, deep feature engineering and domain-specific rule creation are restricted.
- **Adversarial Robustness**: The models have not been systematically tested against targeted adversarial attacks.

## Ethical Considerations
- **Bias**: The PCA features may inadvertently encode demographic biases. Continuous monitoring for disparate impact across regions/groups is required in production.
- **False Positives**: Flagging legitimate transactions causes customer friction. The threshold is tunable to balance risk and user experience.

## Versioning
- **Current Version**: v1.0.0
- **Frameworks**: scikit-learn 1.4.2, imbalanced-learn 0.12.2
