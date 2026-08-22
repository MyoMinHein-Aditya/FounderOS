import pytest
from unittest.mock import patch, MagicMock
from services.ai_service import AIService

@pytest.fixture
def service(db_session):
    return AIService(db_session)

@patch('services.ai_service.get_context')
@patch('services.ai_service.get_history')
@patch('services.ai_service.save_message')
@patch('services.ai_service.founder_agent.chat')
def test_process_chat(mock_chat, mock_save, mock_get_hist, mock_get_ctx, service):
    mock_chat.return_value = "Response"
    mock_get_ctx.return_value = "Context"
    mock_get_hist.return_value = []
    
    response = service.process_chat("Hello", {"user_id": 1})
    assert response == "Response"
    assert mock_save.call_count == 2
    mock_chat.assert_called_once()

@patch('services.ai_service.get_history')
def test_get_history(mock_get_hist, service):
    mock_get_hist.return_value = ["hist1"]
    res = service.get_history(1)
    assert res == ["hist1"]

@patch('services.ai_service.founder_agent.chat')
def test_generate_swot(mock_chat, service):
    with patch('services.startup_service.StartupService') as mock_startup_service_class:
        mock_instance = mock_startup_service_class.return_value
        mock_instance.compile_data.return_value = {"name": "Test"}
        mock_chat.return_value = "SWOT"
        res = service.generate_swot(1, 1)
        assert res == "SWOT"

def test_generate_swot_not_found(service):
    with patch('services.startup_service.StartupService') as mock_startup_service_class:
        mock_instance = mock_startup_service_class.return_value
        mock_instance.compile_data.return_value = None
        res = service.generate_swot(1, 1)
        assert res == "Startup not found."
