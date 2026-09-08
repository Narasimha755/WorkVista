import urllib.request
import json

BASE_URL = "http://localhost:8000/api"

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.headers, resp.read()

def post(endpoint, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.headers, resp.read()

def patch(endpoint, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers={"Content-Type": "application/json"}, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.headers, resp.read()

def put(endpoint, data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}{endpoint}", data=body, headers={"Content-Type": "application/json"}, method="PUT")
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.headers, resp.read()

print("--- 1. Testing Health ---")
status, _, body = get("/health")
assert status == 200
print("Health status:", json.loads(body)["status"])

print("--- 2. Testing Dashboard ---")
status, _, body = get("/dashboard")
assert status == 200
dash = json.loads(body)
assert dash["has_data"] is True
assert dash["has_temporal_data"] is False
assert "Historical longitudinal observations are not available" in dash["temporal_message"]
assert dash["kpis"]["total_employees"]["sparkline"] == []
assert dash["prediction_engine"]["task_type"] == "regression"
assert dash["prediction_engine"]["r2_score"] is not None
assert dash["prediction_engine"]["training_period"] == "Single period snapshot (520 records)"
print(f"Dashboard verified: {dash['kpis']['total_employees']['value']} employees, R2={dash['prediction_engine']['r2_score']}, period='{dash['prediction_engine']['training_period']}'")

print("--- 3. Testing Analytics ---")
status, _, body = get("/analytics")
assert status == 200
analytics = json.loads(body)
assert analytics["has_temporal_data"] is False
assert len(analytics["risk_distribution"]) == 3
print("Risk tiers verified:", [t["name"] + ": " + str(t["count"]) for t in analytics["risk_distribution"]])

print("--- 4. Testing Employee Notes & Tasks & Exports ---")
status, _, body = get("/employees?page=1&page_size=1")
emp_id = json.loads(body)["items"][0]["employee_id"]

# Note
status, _, body = post(f"/employees/{emp_id}/notes", {"content": "Verified production quality note."})
assert status == 200
note = json.loads(body)
assert note["author"] == "NARASIMHA"
print(f"Note added: id={note['id']}, author={note['author']}")

# Task
status, _, body = post(f"/employees/{emp_id}/tasks", {"title": "Verify Model Calibration", "task_type": "Performance Review"})
assert status == 200
task = json.loads(body)
task_id = task["id"]
print(f"Task created: id={task_id}, title='{task['title']}', status='{task['status']}'")

status, _, body = patch(f"/employees/{emp_id}/tasks/{task_id}", {"status": "Completed"})
assert status == 200
assert json.loads(body)["status"] == "Completed"
print(f"Task patched to Completed: id={task_id}")

# Exports
status, headers, pdf_bytes = get(f"/employees/{emp_id}/export/pdf")
assert status == 200
assert headers.get("Content-Type") == "application/pdf"
assert len(pdf_bytes) > 1000
print(f"Employee PDF Export verified: {len(pdf_bytes)} bytes")

status, headers, csv_bytes = get(f"/employees/{emp_id}/export/csv")
assert status == 200
assert "Field,Value" in csv_bytes.decode()
print(f"Employee CSV Export verified: {len(csv_bytes)} bytes")

status, headers, json_bytes = get(f"/employees/{emp_id}/export/json")
assert status == 200
parsed_profile = json.loads(json_bytes)
assert parsed_profile["author"] == "NARASIMHA"
print(f"Employee JSON Export verified: Author={parsed_profile['author']}")

print("--- 5. Testing Executive Report PDF ---")
status, _, body = post("/reports", {"title": "Q3 Final Audit Report", "report_type": "Executive Summary"})
assert status == 200
rep_id = json.loads(body)["id"]
print(f"Report created with ID: {rep_id}")

status, headers, rep_pdf = get(f"/reports/{rep_id}/pdf")
assert status == 200
assert headers.get("Content-Type") == "application/pdf"
assert len(rep_pdf) > 1000
print(f"Executive Report PDF verified: {len(rep_pdf)} bytes")

print("--- 6. Testing Settings Validation ---")
try:
    put("/settings", {"high_perf_threshold": 60.0, "medium_perf_threshold": 75.0, "risk_threshold": 50.0, "default_model": "RandomForest", "test_split": 0.2, "random_seed": 42, "default_date_range": "Last 30 Days", "default_department": "All Departments", "data_retention_days": 365, "auto_retrain_enabled": True})
    print("ERROR: Should have failed threshold validation!")
except urllib.error.HTTPError as e:
    assert e.code == 400
    print("Invalid thresholds correctly rejected with 400 Bad Request!")

print("--- 7. Testing Audit Logs User ---")
status, _, body = get("/audit")
logs = json.loads(body)
assert any(l["user"] == "NARASIMHA" for l in logs)
print(f"Audit logs verified: {len(logs)} logs, confirmed user 'NARASIMHA' exists in audit trail.")

print("\n>>> ALL E2E VERIFICATION CHECKS PASSED PERFECTLY! <<<")
