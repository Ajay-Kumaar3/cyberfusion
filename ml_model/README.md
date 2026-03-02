# CyberFusion MuleDetector v2.3

Trained ML model for real-time money mule detection.

## Files

| File | Description |
|------|-------------|
| `training_metadata.json` | Full training config, dataset stats, architecture |
| `training_history.json` | Epoch-by-epoch loss/AUC curves (127 epochs) |
| `evaluation_report.json` | Test set metrics, confusion matrix, calibration |
| `feature_importance.json` | SHAP values for all 47 features |
| `model_card.json` | Responsible AI documentation |
| `model_weights.npz` | Compressed model weights (NumPy format) |
| `training_log.txt` | Full training console output |
| `scaler_config.json` | StandardScaler mean/variance for inference |
| `inference_samples.json` | Sample predictions on known accounts |

## Quick Stats

- **AUC-ROC:** 0.9923
- **Mule Detection F1:** 0.9673  
- **Training Records:** 2,847,293
- **Features:** 47
- **Inference Latency (p95):** 4.1ms

## Usage

```python
import numpy as np
import json

# Load scaler config
with open('scaler_config.json') as f:
    scaler = json.load(f)

# Load weights
weights = np.load('model_weights.npz')

# Normalize input features
def normalize(features):
    mean = np.array(scaler['mean_'])
    scale = np.array(scaler['scale_'])
    return (features - mean) / scale
```
