from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_phase3():
    # Since these are generic and don't strictly require auth in their endpoints for this basic test, we can just hit them
    note_resp = client.post("/notes/", json={"name": "My Note"})
    print("Note Create:", note_resp.status_code, note_resp.json())

    crm_resp = client.post("/crm_leads/", json={"name": "Big Client"})
    print("CRM Create:", crm_resp.status_code, crm_resp.json())

    cal_resp = client.post("/calendar_events/", json={"name": "Meeting"})
    print("Calendar Create:", cal_resp.status_code, cal_resp.json())

    team_resp = client.post("/teams/", json={"name": "Engineering"})
    print("Team Create:", team_resp.status_code, team_resp.json())

    print("Phase 3 Test Complete")

if __name__ == "__main__":
    test_phase3()
