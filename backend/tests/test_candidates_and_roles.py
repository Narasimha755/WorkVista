from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_roles_crud():
    # 1. List roles
    res = client.get("/api/roles")
    assert res.status_code == 200
    roles = res.json()
    assert len(roles) >= 6

    # 2. Create a new role
    new_role = {
        "title": "Lead DevOps Architect",
        "department": "Engineering",
        "location": "Remote",
        "required_skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
        "preferred_skills": ["Python", "Go"],
        "min_experience": 5.0,
        "max_experience": 12.0,
        "education": "Bachelor's Degree",
        "min_salary": 125000.0,
        "max_salary": 170000.0,
        "employment_type": "Full-Time",
        "description": "Architecting resilient multi-region infrastructure and zero-trust CI/CD."
    }
    create_res = client.post("/api/roles", json=new_role)
    assert create_res.status_code == 200
    role_id = create_res.json()["id"]

    # 3. Update role
    up_res = client.put(f"/api/roles/{role_id}", json={"location": "Global Remote"})
    assert up_res.status_code == 200

def test_candidates_lifecycle_and_match():
    # 1. List candidates
    res = client.get("/api/candidates?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 18
    assert len(data["items"]) <= 10

    # 2. Create candidate
    cand_payload = {
        "name": "Devin Test Candidate",
        "email": "devin.test@enterprise.com",
        "phone": "(555) 999-0000",
        "location": "Remote",
        "role_title": "Senior Software Engineer",
        "department": "Engineering",
        "experience": 6.0,
        "skills": ["React", "TypeScript", "FastAPI", "SQL", "Docker", "AWS"],
        "education": "Bachelor's in Computer Science",
        "expected_salary": 130000.0,
        "availability": "Immediate",
        "notice_period": "None",
        "source": "Direct",
        "status": "New"
    }
    c_res = client.post("/api/candidates", json=cand_payload)
    assert c_res.status_code == 200
    c_json = c_res.json()
    assert c_json["success"] is True
    cand_id = c_json["candidate_id"]
    assert c_json["match_score"] > 70.0

    # 3. Advance stage to Screening -> Shortlisted -> Interview
    s_res = client.patch(f"/api/candidates/{cand_id}/stage", json={"status": "Screening", "notes": "Passed phone screen."})
    assert s_res.status_code == 200
    assert s_res.json()["new_status"] == "Screening"

    # 4. Schedule interview
    inter_payload = {
        "candidate_id": cand_id,
        "scheduled_time": "Tomorrow, 2:00 PM",
        "interview_type": "Technical Architecture",
        "notes": "System design deep dive."
    }
    i_res = client.post("/api/interviews", json=inter_payload)
    assert i_res.status_code == 200
    inter_id = i_res.json()["interview_id"]

    # 5. Complete interview with rating
    patch_i_res = client.patch(f"/api/interviews/{inter_id}", json={"status": "Completed", "rating": 4.9, "feedback": "Exceptional knowledge."})
    assert patch_i_res.status_code == 200

    # 6. Advance to Offer then Hired
    client.patch(f"/api/candidates/{cand_id}/stage", json={"status": "Offer"})
    client.patch(f"/api/candidates/{cand_id}/stage", json={"status": "Hired"})

    # 7. Convert Candidate to Employee
    conv_res = client.post(f"/api/candidates/{cand_id}/convert-to-employee", json={"assigned_role": "Senior Software Engineer", "assigned_department": "Engineering"})
    assert conv_res.status_code == 200
    emp_id = conv_res.json()["employee_id"]
    assert "EMP-" in emp_id

    # Verify employee exists in directory
    emp_chk = client.get(f"/api/employees/{emp_id}")
    assert emp_chk.status_code == 200
    assert emp_chk.json()["employee_name"] == "Devin Test Candidate"

def test_resume_upload_parsing():
    sample_text = """
    Jane Doe
    jane.doe@workvista.ai | (555) 765-4321 | San Francisco, CA
    
    Senior Full-Stack Engineer with 7 years of experience in React, TypeScript, Python, FastAPI, SQL, Docker, and AWS.
    Education: Master's in Computer Science.
    """
    res = client.post(
        "/api/candidates/upload-resume",
        files={"file": ("jane_doe_resume.txt", sample_text.encode("utf-8"), "text/plain")}
    )
    assert res.status_code == 200
    parsed = res.json()["parsed_data"]
    assert "Jane Doe" in parsed["name"]
    assert parsed["email"] == "jane.doe@workvista.ai"
    assert parsed["phone"] == "(555) 765-4321"
    assert "React" in parsed["skills"]
    assert "FastAPI" in parsed["skills"]
    assert parsed["experience"] >= 6.0
