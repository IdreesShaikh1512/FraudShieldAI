"""
Data Validation Module for FraudShield AI ML Pipeline.

Validates the raw creditcard.csv dataset before any processing.
Raises DataValidationError on critical failures.
"""
from __future__ import annotations
import hashlib
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

EXPECTED_COLUMNS = ["Time", "Amount", "Class"] + [f"V{i}" for i in range(1, 29)]


class DataValidationError(Exception):
    """Raised when the dataset fails critical validation checks."""
    pass


@dataclass
class ValidationReport:
    """Contains the results of all validation checks."""
    is_valid: bool = True
    dataset_hash: str = ""
    row_count: int = 0
    fraud_count: int = 0
    fraud_rate: float = 0.0
    null_counts: dict[str, int] = field(default_factory=dict)
    duplicate_count: int = 0
    amount_negatives: int = 0
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "dataset_hash": self.dataset_hash,
            "row_count": self.row_count,
            "fraud_count": self.fraud_count,
            "fraud_rate": self.fraud_rate,
            "null_counts": self.null_counts,
            "duplicate_count": self.duplicate_count,
            "amount_negatives": self.amount_negatives,
            "warnings": self.warnings,
            "errors": self.errors,
        }


class DataValidator:
    """Validates raw creditcard.csv before ML pipeline ingestion."""

    def validate(self, data_path: Path) -> ValidationReport:
        """
        Run all validation checks on the dataset.

        Args:
            data_path: Path to creditcard.csv

        Returns:
            ValidationReport with findings

        Raises:
            DataValidationError: if critical checks fail
        """
        report = ValidationReport()
        logger.info("Starting data validation", extra={"path": str(data_path)})

        if not data_path.exists():
            report.is_valid = False
            report.errors.append(f"File not found: {data_path}")
            raise DataValidationError(f"Dataset not found at {data_path}")

        # Compute dataset hash for reproducibility
        report.dataset_hash = self._compute_hash(data_path)
        logger.info("Dataset hash computed", extra={"hash": report.dataset_hash[:16]})

        df = pd.read_csv(data_path)

        # 1. Schema validation
        missing_cols = set(EXPECTED_COLUMNS) - set(df.columns)
        if missing_cols:
            report.is_valid = False
            msg = f"Missing columns: {missing_cols}"
            report.errors.append(msg)
            raise DataValidationError(msg)
        logger.info("Schema validation passed")

        # 2. Row count
        report.row_count = len(df)
        if report.row_count < 1000:
            report.warnings.append(f"Suspiciously low row count: {report.row_count}")

        # 3. Class distribution
        report.fraud_count = int(df["Class"].sum())
        report.fraud_rate = report.fraud_count / report.row_count
        if report.fraud_rate > 0.05:
            report.warnings.append(f"Fraud rate {report.fraud_rate:.4f} is higher than expected (>5%)")
        logger.info(
            "Class distribution",
            extra={"fraud_count": report.fraud_count, "fraud_rate": f"{report.fraud_rate:.4f}"},
        )

        # 4. Null checks
        null_counts = df.isnull().sum()
        report.null_counts = null_counts[null_counts > 0].to_dict()
        if report.null_counts:
            report.warnings.append(f"Null values found: {report.null_counts}")

        # 5. Duplicate check
        report.duplicate_count = int(df.duplicated().sum())
        if report.duplicate_count > 0:
            report.warnings.append(f"{report.duplicate_count} duplicate rows found")

        # 6. Amount range check
        report.amount_negatives = int((df["Amount"] < 0).sum())
        if report.amount_negatives > 0:
            report.errors.append(f"{report.amount_negatives} transactions with negative Amount")
            report.is_valid = False

        # 7. Class column is binary
        unique_classes = set(df["Class"].unique())
        if unique_classes - {0, 1}:
            report.errors.append(f"Class column contains unexpected values: {unique_classes}")
            report.is_valid = False

        if not report.is_valid:
            raise DataValidationError(f"Validation failed: {report.errors}")

        logger.info("Data validation complete", extra={"warnings": len(report.warnings)})
        return report

    @staticmethod
    def _compute_hash(path: Path) -> str:
        sha256 = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)
        return sha256.hexdigest()
