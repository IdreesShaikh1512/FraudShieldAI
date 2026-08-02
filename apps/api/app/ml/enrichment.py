import hashlib

class SyntheticEnrichmentService:
    @staticmethod
    def enrich_transaction(amount: float, is_fraud: bool = False) -> dict:
        # Deterministic generation based on amount
        seed = str(amount).encode('utf-8')
        h = int(hashlib.md5(seed).hexdigest(), 16)
        
        merchants = ['Amazon', 'Walmart', 'Apple', 'Starbucks', 'Target']
        categories = ['Retail', 'Groceries', 'Electronics', 'Food', 'Clothing']
        countries = ['US', 'UK', 'CA', 'AU', 'DE']
        devices = ['Mobile', 'Desktop', 'Tablet']
        
        if is_fraud:
            countries = ['RU', 'CN', 'NG', 'BR', 'US']
            
        return {
            'merchant_name': merchants[h % len(merchants)],
            'merchant_category': categories[(h // 5) % len(categories)],
            'country_code': countries[(h // 25) % len(countries)],
            'card_last4': f'{(h % 10000):04d}',
            'device_type': devices[(h // 125) % len(devices)]
        }
