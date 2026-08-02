# ──────────────────────────────────────────────────
# Dockerfile.ml — ML Training Pipeline
# ──────────────────────────────────────────────────

FROM python:3.11-slim AS ml-runner
LABEL maintainer="FraudShield AI Team"
LABEL description="ML training pipeline for FraudShield AI"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY ml/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY ml/ ./ml/

# Mount the dataset and output directory from the host
# Usage:
#   docker run --rm \
#     -v /path/to/creditcard.csv:/app/ml/data/raw/creditcard.csv:ro \
#     -v /path/to/output/models:/app/ml/models \
#     fraudshield-ml python ml/pipeline/run_pipeline.py --data-path /app/ml/data/raw/creditcard.csv

ENV PYTHONUNBUFFERED=1

CMD ["python", "ml/pipeline/run_pipeline.py", "--help"]
