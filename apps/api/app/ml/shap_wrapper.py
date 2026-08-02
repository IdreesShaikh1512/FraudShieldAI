import numpy as np

class SHAPWrapper:
    @staticmethod
    def get_local_explanation(explainer, instance_array, feature_names):
        try:
            shap_values = explainer.shap_values(instance_array)
            if isinstance(shap_values, list):
                shap_values = shap_values[1] # For binary classification
            
            vals = shap_values[0]
            abs_vals = np.abs(vals)
            total = np.sum(abs_vals) + 1e-9
            
            explanation = []
            for i, name in enumerate(feature_names):
                explanation.append({
                    'feature_name': name,
                    'value': float(instance_array[0, i]),
                    'shap_value': float(vals[i]),
                    'contribution_pct': float((abs_vals[i] / total) * 100)
                })
            
            explanation.sort(key=lambda x: abs(x['shap_value']), reverse=True)
            return explanation[:5]
        except Exception:
            return [{'feature_name': 'Fallback', 'value': 0, 'shap_value': 0, 'contribution_pct': 0}]
