import os

services = [f for f in os.listdir('services') if f.endswith('_service.py')]

for s in services:
    module = s.replace('.py', '')
    class_name = ''.join(word.capitalize() for word in module.split('_'))
    
    test_content = f"""import pytest
from unittest.mock import patch, MagicMock
from services.{module} import {class_name}

@pytest.fixture
def service(db_session):
    # This is a generic setup. Some services might need specific repos.
    pass

def test_init(db_session):
    pass
"""
    with open(f"tests/services/test_{module}.py", "w") as f:
        f.write(test_content)
