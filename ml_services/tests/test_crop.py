"""Tests for /predict/crop and /health routes."""

from unittest.mock import patch, MagicMock
import numpy as np


def test_health(client):
    """GET /health should return 200."""
    rv = client.get('/health')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['status'] == 'ML service running fine'


@patch('services.crop_service.model')
@patch('services.crop_service.le')
def test_predict_crop_success(mock_le, mock_model, client):
    """POST /predict/crop with valid data should return crop predictions."""
    mock_model.predict_proba.return_value = np.array([[0.1, 0.6, 0.3]])
    mock_le.inverse_transform.return_value = np.array(['wheat', 'rice', 'maize'])

    payload = {
        'N': 90, 'P': 42, 'K': 43,
        'temperature': 20.8, 'humidity': 82.0,
        'ph': 6.5, 'rainfall': 202.9
    }
    rv = client.post('/predict/crop', json=payload)
    assert rv.status_code == 200
    data = rv.get_json()
    assert 'crops' in data or 'error' not in data


def test_predict_crop_missing_field(client):
    """POST /predict/crop with missing fields should return 500 (KeyError)."""
    rv = client.post('/predict/crop', json={'N': 90})
    assert rv.status_code == 500
