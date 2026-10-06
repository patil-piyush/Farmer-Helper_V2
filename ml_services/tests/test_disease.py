"""Tests for /predict/disease route."""

from unittest.mock import patch, MagicMock
import io


def test_predict_disease_no_image_url(client):
    """POST /predict/disease without image_url should return 400."""
    rv = client.post('/predict/disease', data={})
    assert rv.status_code == 400
    data = rv.get_json()
    assert 'error' in data


@patch('routes.disease_routes.detect_disease', return_value=['Leaf_Blight'])
@patch('routes.disease_routes.requests')
@patch('routes.disease_routes.os')
def test_predict_disease_success(mock_os, mock_requests, mock_detect, client):
    """POST /predict/disease with valid image_url should return detections."""
    # Mock the image download
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.content = b'\xff\xd8\xff\xe0' + b'\x00' * 100  # fake JPEG bytes
    mock_requests.get.return_value = mock_response

    # Mock os calls
    mock_os.makedirs = MagicMock()
    mock_os.path.join.return_value = '/tmp/test_image.jpg'
    mock_os.path.getsize.return_value = 104  # non-zero
    mock_os.remove = MagicMock()

    # Use builtins open mock so the "with open()" write works
    fake_open = MagicMock()
    with patch('builtins.open', fake_open):
        rv = client.post('/predict/disease', data={'image_url': 'https://s3.example.com/img.jpg'})

    assert rv.status_code == 200
    data = rv.get_json()
    assert 'detected_diseases' in data
    assert 'Leaf_Blight' in data['detected_diseases']


@patch('routes.disease_routes.requests')
def test_predict_disease_download_failure(mock_requests, client):
    """Should return 400 when image download fails."""
    mock_response = MagicMock()
    mock_response.status_code = 403
    mock_requests.get.return_value = mock_response

    rv = client.post('/predict/disease', data={'image_url': 'https://s3.example.com/bad.jpg'})
    assert rv.status_code == 400
