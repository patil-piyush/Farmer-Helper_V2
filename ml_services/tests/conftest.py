"""
conftest.py – stubs heavy/AWS dependencies via sys.modules BEFORE any
application code is imported.  This lets pytest run without torch, ultralytics,
boto3, or google-cloud-dialogflow installed.
"""

import sys
import types
from unittest.mock import MagicMock

# ---------------------------------------------------------------
# 1. Stub boto3 so crop_service.py can import without AWS creds
# ---------------------------------------------------------------
mock_boto3 = MagicMock()
# s3.head_object / download_file / etc. are auto-created by MagicMock
sys.modules['boto3'] = mock_boto3

# ---------------------------------------------------------------
# 2. Stub ultralytics so disease_service.py can import without torch
# ---------------------------------------------------------------
mock_ultralytics = types.ModuleType('ultralytics')

class FakeYOLO:
    """Minimal YOLO stand-in for testing."""
    def __init__(self, *args, **kwargs):
        self.names = {0: 'Leaf_Blight', 1: 'Rust', 2: 'Healthy'}

    def predict(self, image_path):
        """Return one fake detection."""
        box = MagicMock()
        box.cls = 0  # index into self.names
        result = MagicMock()
        result.boxes = [box]
        return [result]

mock_ultralytics.YOLO = FakeYOLO
sys.modules['ultralytics'] = mock_ultralytics

# ---------------------------------------------------------------
# 3. Stub torch / torchvision (imported transitively)
# ---------------------------------------------------------------
for mod_name in ('torch', 'torchvision', 'torch.nn', 'torch.utils',
                 'torch.utils.data', 'torchvision.transforms'):
    if mod_name not in sys.modules:
        sys.modules[mod_name] = MagicMock()

# ---------------------------------------------------------------
# 4. Stub google-cloud-dialogflow
# ---------------------------------------------------------------
for mod_name in ('google', 'google.cloud', 'google.cloud.dialogflow',
                 'google.cloud.dialogflow_v2', 'google.protobuf',
                 'google.protobuf.json_format'):
    if mod_name not in sys.modules:
        sys.modules[mod_name] = MagicMock()

# ---------------------------------------------------------------
# 5. Now we can safely import the Flask app for the test client
# ---------------------------------------------------------------
import pytest
from app import app as flask_app

@pytest.fixture
def client():
    """Provide a Flask test client."""
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as c:
        yield c
