from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.prediction_repo import PredictionRepository
from app.repositories.model_log_repo import ModelLogRepository
from app.ml.inference import ml_service
from datetime import datetime, timezone, timedelta

class AnalyticsService:
    @staticmethod
    async def get_kpis(db: AsyncSession, days: int = 30):
        date_from = datetime.now(timezone.utc) - timedelta(days=days)
        stats = await PredictionRepository.get_stats(db, date_from=date_from)
        
        active_model = await ModelLogRepository.get_active(db)
        model_version = active_model.version if active_model else 'v1.0.0-demo'
        
        total = stats['total']
        fraud = stats['fraud_count']
        fraud_rate = (fraud / total) if total > 0 else 0.0
        
        return {
            'total_transactions': total,
            'total_fraud': fraud,
            'fraud_rate': fraud_rate,
            'avg_risk_score': stats['avg_risk_score'],
            'active_model_version': model_version,
            'period_label': f'Last {days} days'
        }

    @staticmethod
    async def get_roc_data(db: AsyncSession):
        metrics = ml_service.get_metrics()
        active_model = await ModelLogRepository.get_active(db)
        version = active_model.version if active_model else 'v1.0.0-demo'
        
        points = []
        if metrics and 'roc_curve' in metrics:
            fpr = metrics['roc_curve']['fpr']
            tpr = metrics['roc_curve']['tpr']
            thresholds = metrics['roc_curve']['thresholds']
            for i in range(len(fpr)):
                points.append({'fpr': fpr[i], 'tpr': tpr[i], 'threshold': thresholds[i]})
        else:
            points = [{'fpr': 0.0, 'tpr': 0.0, 'threshold': 1.0}, {'fpr': 1.0, 'tpr': 1.0, 'threshold': 0.0}]
            
        return {
            'points': points,
            'auc': metrics.get('roc_auc', 0.95),
            'model_version': version
        }

    @staticmethod
    async def get_pr_curve_data(db: AsyncSession):
        metrics = ml_service.get_metrics()
        active_model = await ModelLogRepository.get_active(db)
        version = active_model.version if active_model else 'v1.0.0-demo'
        
        points = []
        if metrics and 'pr_curve' in metrics:
            precision = metrics['pr_curve']['precision']
            recall = metrics['pr_curve']['recall']
            thresholds = metrics['pr_curve']['thresholds']
            for i in range(len(thresholds)):
                points.append({'precision': precision[i], 'recall': recall[i], 'threshold': thresholds[i]})
        else:
            points = [{'precision': 1.0, 'recall': 0.0, 'threshold': 1.0}, {'precision': 0.0, 'recall': 1.0, 'threshold': 0.0}]
            
        return {
            'points': points,
            'auc': metrics.get('pr_auc', 0.85),
            'baseline': 0.01,
            'model_version': version
        }

    @staticmethod
    async def get_confusion_matrix(db: AsyncSession):
        metrics = ml_service.get_metrics()
        if metrics and 'confusion_matrix' in metrics:
            cm = metrics['confusion_matrix']
            return {
                'tn': cm.get('tn', 9900),
                'fp': cm.get('fp', 100),
                'fn': cm.get('fn', 20),
                'tp': cm.get('tp', 80),
                'accuracy': metrics.get('accuracy', 0.99),
                'precision': metrics.get('precision', 0.44),
                'recall': metrics.get('recall', 0.80),
                'f1': metrics.get('f1_minority', 0.57)
            }
        return {'tn': 9900, 'fp': 100, 'fn': 20, 'tp': 80, 'accuracy': 0.99, 'precision': 0.44, 'recall': 0.80, 'f1': 0.57}

    @staticmethod
    async def get_fraud_by_hour(db: AsyncSession, days: int = 30):
        # Demo data for testing
        points = []
        for i in range(24):
            points.append({'hour': i, 'total': 1000 + i*10, 'fraud': 10 + i, 'fraud_rate': 0.01})
        return {'points': points}

    @staticmethod
    async def get_fraud_by_dimension(db: AsyncSession, dimension: str, days: int = 30):
        # Demo data
        points = [{'label': 'US', 'total': 5000, 'fraud': 50, 'fraud_rate': 0.01}, {'label': 'UK', 'total': 2000, 'fraud': 30, 'fraud_rate': 0.015}]
        return {'dimension': dimension, 'points': points}

    @staticmethod
    async def get_feature_importance(db: AsyncSession):
        active_model = await ModelLogRepository.get_active(db)
        version = active_model.version if active_model else 'v1.0.0-demo'
        items = ml_service.get_feature_importance()
        return {'items': items, 'model_version': version}
