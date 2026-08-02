import asyncio
from datetime import datetime, timezone
from app.core.database import AsyncSessionLocal, init_db
from app.repositories.user_repo import UserRepository
from app.repositories.model_log_repo import ModelLogRepository
from app.core.security import hash_password

async def seed_demo_data():
    await init_db()
    async with AsyncSessionLocal() as db:
        users_to_create = [
            {'email': 'admin@fraudshield.ai', 'password': 'Admin@123456', 'full_name': 'System Administrator', 'role': 'admin'},
            {'email': 'analyst@fraudshield.ai', 'password': 'Analyst@123456', 'full_name': 'Risk Analyst', 'role': 'analyst'},
            {'email': 'auditor@fraudshield.ai', 'password': 'Auditor@123456', 'full_name': 'Compliance Auditor', 'role': 'auditor'}
        ]
        
        for u in users_to_create:
            existing = await UserRepository.get_by_email(db, u['email'])
            if not existing:
                pwd = hash_password(u['password'])
                user = await UserRepository.create(db, u['email'], pwd, u['full_name'], u['role'])
                print(f"Created demo user: {u['email']} ({u['role']})")
            else:
                print(f"User already exists: {u['email']}")

        # ModelLog
        existing_model = await ModelLogRepository.get_by_version(db, 'v1.0.0-demo')
        if not existing_model:
            mlog = await ModelLogRepository.create(
                db, 
                'demo_model', 
                'v1.0.0-demo', 
                datetime.now(timezone.utc), 
                {'pr_auc': 0.85, 'roc_auc': 0.95, 'f1_minority': 0.75, 'recall_at_90p': 0.90},
                {'estimators': 100},
                'demo-hash'
            )
            await ModelLogRepository.activate_version(db, mlog.version)
            print("Created demo model_log")
        
        await db.commit()

if __name__ == '__main__':
    asyncio.run(seed_demo_data())
