import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_copilot_query_high_risk():
    response = client.post("/api/copilot/query", json={"query": "Who are the highest-risk employees?"})
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "high_flight_risk"
    assert "supporting_records" in data
    assert len(data["key_metrics"]) >= 2
    assert len(data["suggested_followups"]) >= 1

def test_copilot_query_compare_departments():
    response = client.post("/api/copilot/query", json={"query": "Compare Engineering and Sales"})
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "compare_departments"
    assert "vs" in data["headline"] or "Engineering" in data["headline"]

def test_copilot_query_drivers():
    response = client.post("/api/copilot/query", json={"query": "What are the strongest productivity drivers?"})
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "productivity_drivers"
    assert len(data["supporting_records"]) >= 3

def test_scenario_simulation():
    payload = {
        "workload_delta_pct": -10.0,
        "attendance_delta_pct": 5.0,
        "engagement_delta_pct": 8.0,
        "training_uplift_pct": 10.0,
        "target_department": "All"
    }
    response = client.post("/api/scenario/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_avg_productivity" in data
    assert "productivity_delta" in data
    assert data["productivity_delta"] > 0
    assert "department_impacts" in data
    assert len(data["department_impacts"]) >= 3

def test_employee_digital_twin_and_simulate():
    # First get an employee ID
    emp_res = client.get("/api/employees?page=1&page_size=1")
    assert emp_res.status_code == 200
    items = emp_res.json()["items"]
    assert len(items) > 0
    emp_id = items[0]["employee_id"]

    # Digital twin
    dt_res = client.get(f"/api/employees/{emp_id}/digital-twin")
    assert dt_res.status_code == 200
    dt_data = dt_res.json()
    assert dt_data["employee_id"] == emp_id
    assert "day_30_forecast" in dt_data["predicted_state"]
    assert "day_90_forecast" in dt_data["predicted_state"]
    assert len(dt_data["pressure_signals"]) >= 3
    assert len(dt_data["explainability_waterfall"]) >= 3

    # Simulation
    sim_res = client.post(f"/api/employees/{emp_id}/simulate", json={"workload_delta": -10, "skill_delta": 5})
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert "simulated_productivity" in sim_data
    assert "simulated_flight_risk" in sim_data

def test_dashboard_pulse_and_alerts():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    dash = res.json()
    assert "workforce_pulse" in dash
    assert dash["workforce_pulse"]["health_score"] > 0
    assert "executive_alerts" in dash
    assert len(dash["executive_alerts"]) >= 3
    assert "capacity_utilization" in dash
    assert len(dash["capacity_utilization"]) >= 3
