from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_auth_flow():
    reg_response = client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@test.com",
        "password": "password123"
    })
    print("Register Response:", reg_response.status_code, reg_response.json())

    if reg_response.status_code == 200:
        login_response = client.post("/auth/login", json={
            "email": "test@test.com",
            "password": "password123"
        })
        print("Login Response:", login_response.status_code, login_response.json())
        token = login_response.json().get("access_token")

        me_response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        print("Me Response:", me_response.status_code, me_response.json())

if __name__ == "__main__":
    test_auth_flow()
