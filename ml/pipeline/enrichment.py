"""
SYNTHETIC ENRICHMENT MODULE

IMPORTANT: This module generates synthetic metadata for transactions
(country, merchant, device type) for UI/analytics/demo purposes ONLY.

This enrichment data is NEVER used as input to the ML models.
The ML models train and predict exclusively on the original dataset
features: Time, Amount, V1-V28.

This boundary is documented in the model card and enforced in the
ML pipeline (see run_pipeline.py: enrichment applied AFTER model training).
"""
import logging
from typing import Dict, Any, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

class SyntheticEnricher:
    """Adds synthetic business metadata to transactions for demo purposes."""
    
    COUNTRIES = ['GB', 'DE', 'FR', 'NL', 'ES', 'IT', 'US', 'IE', 'SE', 'CH']
    COUNTRY_WEIGHTS = [0.25, 0.20, 0.15, 0.10, 0.08, 0.07, 0.05, 0.04, 0.03, 0.03]
    
    MERCHANT_CATEGORIES = ['grocery', 'gas_station', 'restaurant', 'online_retail', 'atm', 'hotel', 'airline', 'pharmacy']
    
    MERCHANTS = {
        'grocery': ['Tesco', 'Aldi', 'Sainsburys', 'Carrefour', 'Lidl'],
        'gas_station': ['Shell', 'BP', 'Esso', 'Total', 'Texaco'],
        'restaurant': ['Nandos', 'McDonalds', 'Local Bistro', 'Starbucks', 'Pizza Express'],
        'online_retail': ['Amazon', 'Ebay', 'Apple Store', 'ASOS', 'Zalando'],
        'atm': ['Barclays ATM', 'HSBC ATM', 'Euronet ATM', 'Santander ATM', 'NatWest ATM'],
        'hotel': ['Hilton', 'Marriott', 'Holiday Inn', 'Premier Inn', 'Ibis'],
        'airline': ['Ryanair', 'EasyJet', 'British Airways', 'Lufthansa', 'Air France'],
        'pharmacy': ['Boots', 'Superdrug', 'LloydsPharmacy', 'Local Pharmacy']
    }
    
    DEVICE_TYPES = ['pos_terminal', 'mobile_app', 'web', 'atm']

    def enrich_dataframe(self, df: pd.DataFrame, random_state: int = 42) -> pd.DataFrame:
        """
        Adds synthetic enrichment columns to a full dataframe.
        """
        logger.info("Applying synthetic enrichment for UI/analytics...")
        df_out = df.copy()
        
        np.random.seed(random_state)
        n = len(df)
        
        # Pre-generate values
        countries = np.random.choice(self.COUNTRIES, size=n, p=self.COUNTRY_WEIGHTS)
        categories = []
        merchants = []
        devices = []
        card_last4s = [f"{np.random.randint(1000, 9999)}" for _ in range(n)]
        
        is_fraud = df['Class'].values if 'Class' in df else np.zeros(n)
        
        for i in range(n):
            if is_fraud[i] == 1:
                # Fraud patterns: more online, ATM, unusual devices
                cat = np.random.choice(['online_retail', 'atm', 'grocery'], p=[0.6, 0.3, 0.1])
                dev = 'web' if cat == 'online_retail' else 'atm' if cat == 'atm' else 'pos_terminal'
            else:
                # Normal patterns
                cat = np.random.choice(self.MERCHANT_CATEGORIES)
                if cat == 'online_retail':
                    dev = np.random.choice(['web', 'mobile_app'], p=[0.4, 0.6])
                elif cat == 'atm':
                    dev = 'atm'
                else:
                    dev = np.random.choice(['pos_terminal', 'mobile_app'], p=[0.9, 0.1])
                    
            merch = np.random.choice(self.MERCHANTS[cat])
            
            categories.append(cat)
            merchants.append(merch)
            devices.append(dev)
            
        df_out['merchant_name'] = merchants
        df_out['merchant_category'] = categories
        df_out['country_code'] = countries
        df_out['device_type'] = devices
        df_out['card_last4'] = card_last4s
        
        logger.info("Synthetic enrichment complete.")
        return df_out

    def enrich_single(self, amount: float, is_fraud: int = 0, random_state: Optional[int] = None) -> Dict[str, Any]:
        """
        Enriches a single transaction.
        """
        if random_state is not None:
            np.random.seed(random_state)
            
        country = str(np.random.choice(self.COUNTRIES, p=self.COUNTRY_WEIGHTS))
        
        if is_fraud == 1:
            cat = str(np.random.choice(['online_retail', 'atm', 'grocery'], p=[0.6, 0.3, 0.1]))
            dev = 'web' if cat == 'online_retail' else 'atm' if cat == 'atm' else 'pos_terminal'
        else:
            cat = str(np.random.choice(self.MERCHANT_CATEGORIES))
            if cat == 'online_retail':
                dev = str(np.random.choice(['web', 'mobile_app'], p=[0.4, 0.6]))
            elif cat == 'atm':
                dev = 'atm'
            else:
                dev = str(np.random.choice(['pos_terminal', 'mobile_app'], p=[0.9, 0.1]))
                
        merch = str(np.random.choice(self.MERCHANTS[cat]))
        card_last4 = f"{np.random.randint(1000, 9999)}"
        
        return {
            "merchant_name": merch,
            "merchant_category": cat,
            "country_code": country,
            "device_type": dev,
            "card_last4": card_last4
        }
