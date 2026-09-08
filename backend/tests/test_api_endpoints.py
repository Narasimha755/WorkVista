from fastapi.testclient import TestClient
from app.main import app
from app.core.config import DATA_DIR
import os

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_load_demo_data_and_dashboard():
    # 1. Load demo data
    demo_resp = client.post("/api/demo")
    assert demo_resp.status_code == 200
    demo_json = demo_resp.json()
    assert demo_json["success"] is True
    assert demo_json["report"]["total_rows"] >= 500

    # 2. Verify dashboard endpoint
    dash_resp = client.get("/api/dashboard")
    assert dash_resp.status_code == 200
    dash_json = dash_resp.json()
    assert dash_json["has_data"] is True
    assert "kpis" in dash_json
    assert dash_json["kpis"]["total_employees"]["value"] >= 500
    assert len(dash_json["actual_vs_predicted"]) > 0
    assert len(dash_json["productivity_distribution"]) == 3
    assert len(dash_json["department_productivity"]) > 0
    assert len(dash_json["key_factors"]) > 0
    assert len(dash_json["key_insights"]) > 0
    assert len(dash_json["recommended_actions"]) > 0
    assert len(dash_json["recent_employees"]) == 5

def test_employees_list_and_search():
    resp = client.get("/api/employees?page=1&page_size=10")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 500
    assert len(data["items"]) == 10

    # Search for an employee from first item
    first_name = data["items"][0]["employee_name"].split()[0]
    search_resp = client.get(f"/api/employees?search={first_name}")
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert search_data["total"] >= 1

def test_departments_endpoint():
    resp = client.get("/api/departments")
    assert resp.status_code == 200
    depts = resp.json()
    assert len(depts) >= 4

def test_model_performance_endpoint():
    resp = client.get("/api/model")
    assert resp.status_code == 200
    data = resp.json()
    assert data["has_model"] is True
    assert "r2_score" in data
    assert len(data["feature_importances"]) > 0

def test_reports_generation():
    resp = client.post("/api/reports", json={"title": "Q3 Executive Briefing", "report_type": "Executive Summary"})
    assert resp.status_code == 200
    rep = resp.json()
    assert rep["title"] == "Q3 Executive Briefing"
    assert len(rep["key_findings"]) > 0

def test_custom_csv_upload():
    csv_path = DATA_DIR / "sample_custom_workforce.csv"
    assert os.path.exists(csv_path)

    with open(csv_path, "rb") as f:
        response = client.post(
            "/api/upload",
            files={"file": ("sample_custom_workforce.csv", f, "text/csv")}
        )
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["report"]["total_rows"] == 12
    # Verify auto detected columns
    mapping = res_json["report"]["detected_columns"]
    assert mapping.get("employee_id") == "emp_id"
    assert mapping.get("department") == "dept"
    assert mapping.get("productivity_score") == "work_output"

    # Verify dashboard refreshed with uploaded dataset
    dash_resp = client.get("/api/dashboard")
    assert dash_resp.status_code == 200
    dash_json = dash_resp.json()
    assert dash_json["kpis"]["total_employees"]["value"] == 12

def test_export_csv_and_xlsx():
    csv_resp = client.get("/api/export/csv")
    assert csv_resp.status_code == 200
    assert "Employee ID" in csv_resp.text

    xlsx_resp = client.get("/api/export/xlsx")
    assert xlsx_resp.status_code == 200
    assert len(xlsx_resp.content) > 100

def test_report_pdf_download():
    # Generate report
    rep_resp = client.post("/api/reports", json={"title": "Executive PDF Test", "report_type": "Executive Summary"})
    assert rep_resp.status_code == 200
    rep_id = rep_resp.json()["id"]

    # Download PDF
    pdf_resp = client.get(f"/api/reports/{rep_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 500

def test_employee_notes_tasks_and_exports():
    # Get an employee
    emp_resp = client.get("/api/employees?page=1&page_size=1")
    assert emp_resp.status_code == 200
    emp_id = emp_resp.json()["items"][0]["employee_id"]

    # Add note
    note_resp = client.post(f"/api/employees/{emp_id}/notes", json={"content": "Employee demonstrated strong problem solving."})
    assert note_resp.status_code == 200
    note_data = note_resp.json()
    assert note_data["content"] == "Employee demonstrated strong problem solving."
    assert note_data["author"] == "NARASIMHA"

    # List notes
    notes_list_resp = client.get(f"/api/employees/{emp_id}/notes")
    assert notes_list_resp.status_code == 200
    assert len(notes_list_resp.json()) >= 1

    # Create task
    task_resp = client.post(f"/api/employees/{emp_id}/tasks", json={"title": "1-on-1 Performance Check-in", "task_type": "Performance Review"})
    assert task_resp.status_code == 200
    task_data = task_resp.json()
    assert task_data["title"] == "1-on-1 Performance Check-in"
    assert task_data["status"] == "Pending"
    task_id = task_data["id"]

    # Patch task
    patch_resp = client.patch(f"/api/employees/{emp_id}/tasks/{task_id}", json={"status": "Completed"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Completed"

    # Profile exports: PDF, CSV, JSON
    pdf_exp = client.get(f"/api/employees/{emp_id}/export/pdf")
    assert pdf_exp.status_code == 200
    assert pdf_exp.headers["content-type"] == "application/pdf"
    assert len(pdf_exp.content) > 500

    csv_exp = client.get(f"/api/employees/{emp_id}/export/csv")
    assert csv_exp.status_code == 200
    assert "Field,Value" in csv_exp.text

    json_exp = client.get(f"/api/employees/{emp_id}/export/json")
    assert json_exp.status_code == 200
    assert json_exp.json()["employee"]["employee_id"] == emp_id
    assert json_exp.json()["author"] == "NARASIMHA"

def test_settings_validation_and_audit():
    # 1. Invalid thresholds (medium >= high) must be rejected with 400
    bad_payload = {
        "high_perf_threshold": 70.0,
        "medium_perf_threshold": 85.0,
        "risk_threshold": 50.0,
        "default_model": "RandomForest",
        "test_split": 0.2,
        "random_seed": 42,
        "default_date_range": "Last 30 Days",
        "default_department": "All Departments",
        "data_retention_days": 365,
        "auto_retrain_enabled": True
    }
    bad_resp = client.put("/api/settings", json=bad_payload)
    assert bad_resp.status_code == 400

    # 2. Valid thresholds must succeed
    good_payload = {
        "high_perf_threshold": 80.0,
        "medium_perf_threshold": 50.0,
        "risk_threshold": 50.0,
        "default_model": "RandomForest",
        "test_split": 0.2,
        "random_seed": 42,
        "default_date_range": "Last 30 Days",
        "default_department": "All Departments",
        "data_retention_days": 365,
        "auto_retrain_enabled": True
    }
    good_resp = client.put("/api/settings", json=good_payload)
    assert good_resp.status_code == 200

    # 3. Check audit log user
    audit_resp = client.get("/api/audit")
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) > 0
    assert any(log["user"] == "NARASIMHA" for log in logs)

