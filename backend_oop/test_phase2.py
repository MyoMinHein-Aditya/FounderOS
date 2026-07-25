from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_phase2():
    login_response = client.post("/auth/login", json={
        "email": "test@test.com",
        "password": "password123"
    })
    token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    startup_resp = client.post("/startups/", json={
        "name": "My Startup",
        "description": "Building cool things",
        "stage": "Seed",
        "industry": "Tech"
    }, headers=headers)
    print("Startup Create:", startup_resp.status_code, startup_resp.json())
    startup_id = startup_resp.json().get("id")

    goal_resp = client.post("/goals/", json={
        "title": "Launch Beta",
        "description": "Get 100 users",
        "startup_id": startup_id
    }, headers=headers)
    print("Goal Create:", goal_resp.status_code, goal_resp.json())
    goal_id = goal_resp.json().get("id")

    task_resp = client.post("/tasks/", json={
        "title": "Design Landing Page",
        "startup_id": startup_id,
        "goal_id": goal_id
    }, headers=headers)
    print("Task Create:", task_resp.status_code, task_resp.json())

    client.put(f"/goals/{goal_id}/complete", headers=headers)
    client.put(f"/tasks/{task_resp.json().get('id')}/status", json={"status": "Completed"}, headers=headers)

    print("Phase 2 Test Complete")

if __name__ == "__main__":
    test_phase2()
