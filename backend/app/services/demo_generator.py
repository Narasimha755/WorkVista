import random
import numpy as np
import pandas as pd

FIRST_NAMES = [
    "Rahul", "Priya", "Arjun", "Sneha", "Vikram", "Aisha", "Carlos", "Maya", 
    "David", "Fatima", "Elena", "Marcus", "Kavita", "Rohan", "Ananya", "Dev",
    "Sophia", "Chen", "Lucas", "Zara", "Aarav", "Pooja", "Siddharth", "Meera",
    "Alexander", "Amara", "Liam", "Isabella", "Aditya", "Neha", "Gabriel", "Chloe"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Singh", "Khan", "Mendez", "Lin",
    "Kim", "Zahra", "Rostova", "Thorne", "Nair", "Iyer", "Deshmukh", "Gupta",
    "Tanaka", "Silva", "Johnson", "Al-Mansoor", "Kowalski", "Dubois", "Chopra", "Das"
]

DEPARTMENTS = [
    ("Engineering", ["Senior Software Engineer", "DevOps Engineer", "Frontend Architect", "Backend Developer", "QA Lead"]),
    ("Marketing", ["Growth Specialist", "Content Strategist", "SEO Lead", "Brand Manager", "Campaign Analyst"]),
    ("Finance", ["Financial Analyst", "Risk Auditor", "Accountant", "Billing Specialist", "FP&A Associate"]),
    ("HR", ["People Operations Partner", "Talent Acquisition Lead", "HR Generalist", "L&D Specialist", "Compensation Analyst"]),
    ("Operations", ["Supply Chain Coordinator", "Operations Manager", "Process Analyst", "Logistics Planner"]),
    ("Sales", ["Account Executive", "Sales Development Rep", "Enterprise Sales Director", "Client Success Partner"])
]

def generate_demo_dataset(num_records: int = 520, seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic employee workforce data with correlated productivity metrics.
    """
    np.random.seed(seed)
    random.seed(seed)

    records = []
    used_names = set()

    for i in range(1, num_records + 1):
        emp_id = f"EMP-{i:04d}"
        
        # Unique realistic names
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        full_name = f"{first} {last}"
        if full_name in used_names:
            full_name = f"{first} {last} {i % 10}"
        used_names.add(full_name)

        dept_info = random.choice(DEPARTMENTS)
        dept_name = dept_info[0]
        role_name = random.choice(dept_info[1])

        # Feature distributions with realistic variance
        experience = round(float(np.random.gamma(shape=3.0, scale=1.5) + 0.5), 1)
        experience = min(max(experience, 0.5), 18.0)

        # Workload (some overloaded, some balanced)
        workload = round(float(np.random.normal(loc=72.0, scale=12.0)), 1)
        workload = min(max(workload, 35.0), 99.0)

        attendance = round(float(np.random.beta(a=12, b=1.5) * 100.0), 1)
        attendance = min(max(attendance, 60.0), 99.5)

        working_hours = round(float(np.random.normal(loc=41.5, scale=4.5)), 1)
        working_hours = min(max(working_hours, 32.0), 58.0)

        engagement = round(float(np.random.normal(loc=74.0, scale=14.0)), 1)
        engagement = min(max(engagement, 35.0), 98.0)

        skill_level = round(float(np.random.normal(loc=76.0, scale=11.0) + (experience * 0.8)), 1)
        skill_level = min(max(skill_level, 45.0), 99.0)

        projects = int(np.random.poisson(lam=3.2)) + 1
        projects = min(max(projects, 1), 9)

        tasks_completed = int(np.random.normal(loc=28.0, scale=8.0) + (experience * 0.5))
        tasks_completed = min(max(tasks_completed, 8), 65)

        deadline_adherence = round(float(np.random.normal(loc=82.0, scale=9.0)), 1)
        deadline_adherence = min(max(deadline_adherence, 45.0), 99.0)

        # Past productivity score
        baseline_prod = (
            0.28 * skill_level +
            0.24 * engagement +
            0.20 * attendance +
            0.15 * deadline_adherence +
            0.08 * (100.0 - abs(workload - 75.0)) +
            np.random.normal(0, 3.0)
        )
        previous_productivity = round(min(max(baseline_prod, 38.0), 98.0), 1)

        # Current productivity with subtle trend and correlation
        workload_penalty = max(0.0, (workload - 86.0) * 0.6)  # Burnout penalty if overloaded
        current_prod = (
            0.45 * previous_productivity +
            0.18 * engagement +
            0.15 * skill_level +
            0.12 * attendance +
            0.10 * deadline_adherence -
            workload_penalty +
            np.random.normal(0, 2.5)
        )
        productivity_score = round(min(max(current_prod, 35.0), 98.5), 1)

        if productivity_score >= 80.0:
            rating = "High"
        elif productivity_score >= 50.0:
            rating = "Medium"
        else:
            rating = "Low"

        records.append({
            "employee_id": emp_id,
            "employee_name": full_name,
            "department": dept_name,
            "role": role_name,
            "experience": experience,
            "attendance": attendance,
            "workload": workload,
            "working_hours": working_hours,
            "engagement": engagement,
            "skill_level": skill_level,
            "projects": projects,
            "tasks_completed": tasks_completed,
            "deadline_adherence": deadline_adherence,
            "previous_productivity": previous_productivity,
            "productivity_score": productivity_score,
            "performance_rating": rating
        })

    return pd.DataFrame(records)

def seed_recruitment_data(db):
    """
    Seeds realistic job roles, candidates across all pipeline stages,
    interviews, and recruiter notes.
    """
    import json
    from datetime import datetime, timedelta
    from app.models import JobRole, Candidate, Interview, Note, Task, User
    from app.services.candidate_matcher import calculate_candidate_match

    # 1. Ensure active Admin User exists
    admin_user = db.query(User).filter(User.username == "narasimha").first()
    if not admin_user:
        admin_user = User(
            username="narasimha",
            email="narasimha@workvista.ai",
            full_name="NARASIMHA",
            role="Super Admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()

    # 2. Seed Job Roles if empty
    if db.query(JobRole).count() == 0:
        roles_data = [
            {
                "title": "Senior Software Engineer",
                "department": "Engineering",
                "location": "Remote",
                "required_skills": ["React", "TypeScript", "Node.js", "SQL", "FastAPI"],
                "preferred_skills": ["Docker", "Kubernetes", "AWS", "GraphQL"],
                "min_experience": 4.0,
                "max_experience": 9.0,
                "education": "Bachelor's in Computer Science",
                "min_salary": 110000.0,
                "max_salary": 150000.0,
                "employment_type": "Full-Time",
                "description": "Leading full-stack development of enterprise workforce intelligence microservices and real-time visualization systems.",
                "status": "Active"
            },
            {
                "title": "Staff Data Scientist",
                "department": "Engineering",
                "location": "New York / Hybrid",
                "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "Pandas", "SQL"],
                "preferred_skills": ["PyTorch", "TensorFlow", "FastAPI", "Data Analysis"],
                "min_experience": 5.0,
                "max_experience": 10.0,
                "education": "Master's Degree",
                "min_salary": 130000.0,
                "max_salary": 175000.0,
                "employment_type": "Full-Time",
                "description": "Architecting predictive performance algorithms, flight risk models, and SHAP-based model explainability pipelines.",
                "status": "Active"
            },
            {
                "title": "Operations Analytics Lead",
                "department": "Operations",
                "location": "San Francisco / Remote",
                "required_skills": ["Operations Management", "Data Analysis", "SQL", "Tableau", "Process Analyst"],
                "preferred_skills": ["Python", "Agile", "Strategic Planning"],
                "min_experience": 3.0,
                "max_experience": 8.0,
                "education": "Bachelor's Degree",
                "min_salary": 95000.0,
                "max_salary": 135000.0,
                "employment_type": "Full-Time",
                "description": "Optimizing operational capacity utilization, resource allocation, and team workload balancing frameworks.",
                "status": "Active"
            },
            {
                "title": "Product Marketing Manager",
                "department": "Marketing",
                "location": "Austin / Remote",
                "required_skills": ["Product Management", "Content Strategist", "Campaign Analyst", "Figma"],
                "preferred_skills": ["Data Analysis", "SEO Lead", "HTML"],
                "min_experience": 3.0,
                "max_experience": 7.0,
                "education": "Bachelor's Degree",
                "min_salary": 90000.0,
                "max_salary": 125000.0,
                "employment_type": "Full-Time",
                "description": "Driving go-to-market execution, B2B enterprise positioning, and product adoption analytics.",
                "status": "Active"
            },
            {
                "title": "Strategic Talent Partner",
                "department": "HR",
                "location": "Chicago / Remote",
                "required_skills": ["Talent Acquisition", "HR Analytics", "Recruitment", "Employee Relations"],
                "preferred_skills": ["Strategic Planning", "Financial Modeling"],
                "min_experience": 3.0,
                "max_experience": 8.0,
                "education": "Bachelor's Degree",
                "min_salary": 85000.0,
                "max_salary": 115000.0,
                "employment_type": "Full-Time",
                "description": "Orchestrating strategic hiring pipelines, workforce succession planning, and candidate experience excellence.",
                "status": "Active"
            },
            {
                "title": "Enterprise Account Executive",
                "department": "Sales",
                "location": "Remote",
                "required_skills": ["Salesforce", "Customer Success", "Strategic Planning", "Agile"],
                "preferred_skills": ["Financial Modeling", "Data Analysis"],
                "min_experience": 4.0,
                "max_experience": 9.0,
                "education": "Bachelor's Degree",
                "min_salary": 100000.0,
                "max_salary": 160000.0,
                "employment_type": "Full-Time",
                "description": "Executing large enterprise sales cycles, software license agreements, and executive customer relationships.",
                "status": "Active"
            }
        ]

        for r_data in roles_data:
            role = JobRole(
                title=r_data["title"],
                department=r_data["department"],
                location=r_data["location"],
                required_skills=json.dumps(r_data["required_skills"]),
                preferred_skills=json.dumps(r_data["preferred_skills"]),
                min_experience=r_data["min_experience"],
                max_experience=r_data["max_experience"],
                education=r_data["education"],
                min_salary=r_data["min_salary"],
                max_salary=r_data["max_salary"],
                employment_type=r_data["employment_type"],
                description=r_data["description"],
                status=r_data["status"]
            )
            db.add(role)
        db.commit()

    # 3. Seed Candidates across stages if empty
    if db.query(Candidate).count() == 0:
        roles = db.query(JobRole).all()
        role_by_dept = {r.department: r for r in roles}

        seed_candidates = [
            # Engineering Candidates
            {
                "name": "Sarah Jenkins",
                "email": "sarah.jenkins@example.com",
                "phone": "(555) 234-5678",
                "location": "Remote",
                "dept": "Engineering",
                "role": "Senior Software Engineer",
                "experience": 6.5,
                "skills": ["React", "TypeScript", "Node.js", "SQL", "FastAPI", "Docker", "AWS", "Git"],
                "education": "Bachelor's in Computer Science",
                "expected_salary": 135000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "Offer",
                "resume_text": "Senior Full-Stack Engineer with 6.5 years building high-throughput React & FastAPI applications on AWS."
            },
            {
                "name": "Alexander Hayes",
                "email": "alex.hayes@example.com",
                "phone": "(555) 345-6789",
                "location": "New York, NY",
                "dept": "Engineering",
                "role": "Staff Data Scientist",
                "experience": 7.0,
                "skills": ["Python", "Machine Learning", "Scikit-Learn", "Pandas", "PyTorch", "SQL", "FastAPI"],
                "education": "Master's in Machine Learning",
                "expected_salary": 155000.0,
                "availability": "2 Weeks",
                "notice_period": "2 weeks",
                "source": "Referral",
                "status": "Interview",
                "resume_text": "Staff Data Scientist specializing in gradient boosting, predictive retention modeling, and scalable feature stores."
            },
            {
                "name": "Devin Chen",
                "email": "devin.chen@example.com",
                "phone": "(555) 456-7890",
                "location": "Remote",
                "dept": "Engineering",
                "role": "Senior Software Engineer",
                "experience": 5.0,
                "skills": ["TypeScript", "React", "Node.js", "Docker", "REST API", "PostgreSQL"],
                "education": "Bachelor's in Computer Science",
                "expected_salary": 125000.0,
                "availability": "1 Month",
                "notice_period": "30 days",
                "source": "Direct",
                "status": "Shortlisted",
                "resume_text": "Full stack engineer adept at designing reactive component systems and clean REST API microservices."
            },
            {
                "name": "Aarohi Kulkarni",
                "email": "aarohi.k@example.com",
                "phone": "(555) 567-8901",
                "location": "San Francisco, CA",
                "dept": "Engineering",
                "role": "Staff Data Scientist",
                "experience": 4.5,
                "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Pandas"],
                "education": "Ph.D. in Computer Science",
                "expected_salary": 145000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "Screening",
                "resume_text": "Ph.D. researcher with deep expertise in probabilistic forecasting and predictive workforce analytics."
            },
            {
                "name": "Maya Lin",
                "email": "maya.lin@example.com",
                "phone": "(555) 678-9012",
                "location": "Seattle, WA",
                "dept": "Engineering",
                "role": "Senior Software Engineer",
                "experience": 8.0,
                "skills": ["React", "TypeScript", "FastAPI", "Kubernetes", "AWS", "CI/CD", "SQL"],
                "education": "Bachelor's Degree",
                "expected_salary": 140000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Referral",
                "status": "Hired",
                "resume_text": "Cloud architect and senior software engineer with track record leading engineering scale-up."
            },
            {
                "name": "Lucas Vance",
                "email": "lucas.vance@example.com",
                "phone": "(555) 789-0123",
                "location": "Remote",
                "dept": "Engineering",
                "role": "Senior Software Engineer",
                "experience": 3.0,
                "skills": ["JavaScript", "HTML", "CSS", "React"],
                "education": "Bachelor's Degree",
                "expected_salary": 95000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Direct",
                "status": "New",
                "resume_text": "Frontend developer seeking senior level transition with strong UI design skills."
            },

            # Operations Candidates
            {
                "name": "Marcus Sterling",
                "email": "marcus.s@example.com",
                "phone": "(555) 890-1234",
                "location": "San Francisco, CA",
                "dept": "Operations",
                "role": "Operations Analytics Lead",
                "experience": 5.5,
                "skills": ["Operations Management", "Data Analysis", "SQL", "Tableau", "Process Analyst", "Agile"],
                "education": "Bachelor's in Industrial Engineering",
                "expected_salary": 115000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "Interview",
                "resume_text": "Operations analytics lead driving efficiency gains, supply chain throughput, and capacity modeling."
            },
            {
                "name": "Kavita Nair",
                "email": "kavita.nair@example.com",
                "phone": "(555) 901-2345",
                "location": "Remote",
                "dept": "Operations",
                "role": "Operations Analytics Lead",
                "experience": 6.0,
                "skills": ["Operations Management", "SQL", "Data Analysis", "Tableau", "Strategic Planning"],
                "education": "MBA",
                "expected_salary": 120000.0,
                "availability": "2 Weeks",
                "notice_period": "2 weeks",
                "source": "Agency",
                "status": "Shortlisted",
                "resume_text": "MBA operational leader specializing in capacity leveling, workflow optimization, and KPI frameworks."
            },
            {
                "name": "Carlos Gomez",
                "email": "carlos.g@example.com",
                "phone": "(555) 012-3456",
                "location": "Dallas, TX",
                "dept": "Operations",
                "role": "Operations Analytics Lead",
                "experience": 4.0,
                "skills": ["Operations Management", "Data Analysis", "Excel", "Agile"],
                "education": "Bachelor's Degree",
                "expected_salary": 95000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Direct",
                "status": "Screening",
                "resume_text": "Operations coordinator focused on process mapping and backlog resolution."
            },

            # Marketing Candidates
            {
                "name": "Chloe Bennett",
                "email": "chloe.b@example.com",
                "phone": "(555) 123-4567",
                "location": "Austin, TX",
                "dept": "Marketing",
                "role": "Product Marketing Manager",
                "experience": 5.0,
                "skills": ["Product Management", "Content Strategist", "Campaign Analyst", "Figma", "Data Analysis"],
                "education": "Bachelor's in Communications",
                "expected_salary": 110000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "Offer",
                "resume_text": "PMM with track record launching SaaS products, competitive intelligence, and customer analytics."
            },
            {
                "name": "Jordan Thorne",
                "email": "jordan.t@example.com",
                "phone": "(555) 234-8901",
                "location": "Remote",
                "dept": "Marketing",
                "role": "Product Marketing Manager",
                "experience": 4.0,
                "skills": ["Content Strategist", "Campaign Analyst", "Figma", "SEO Lead"],
                "education": "Bachelor's Degree",
                "expected_salary": 95000.0,
                "availability": "2 Weeks",
                "notice_period": "2 weeks",
                "source": "Direct",
                "status": "Screening",
                "resume_text": "Brand and content marketer managing demand-gen campaigns and conversion optimization."
            },

            # HR Candidates
            {
                "name": "Fatima Al-Mansoor",
                "email": "fatima.m@example.com",
                "phone": "(555) 345-9012",
                "location": "Chicago, IL",
                "dept": "HR",
                "role": "Strategic Talent Partner",
                "experience": 6.0,
                "skills": ["Talent Acquisition", "HR Analytics", "Recruitment", "Employee Relations", "Strategic Planning"],
                "education": "Master's in Human Resources",
                "expected_salary": 105000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Referral",
                "status": "Interview",
                "resume_text": "Strategic HR business partner leading talent benchmarking, retention interventions, and executive hiring."
            },
            {
                "name": "Rachel Kim",
                "email": "rachel.kim@example.com",
                "phone": "(555) 456-0123",
                "location": "Remote",
                "dept": "HR",
                "role": "Strategic Talent Partner",
                "experience": 3.5,
                "skills": ["Recruitment", "Talent Acquisition", "Employee Relations"],
                "education": "Bachelor's Degree",
                "expected_salary": 85000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Direct",
                "status": "New",
                "resume_text": "Talent sourcer and recruiter focused on technical pipeline development."
            },

            # Sales Candidates
            {
                "name": "Gabriel Santos",
                "email": "gabriel.s@example.com",
                "phone": "(555) 567-1234",
                "location": "Remote",
                "dept": "Sales",
                "role": "Enterprise Account Executive",
                "experience": 7.0,
                "skills": ["Salesforce", "Customer Success", "Strategic Planning", "Financial Modeling", "Agile"],
                "education": "Bachelor's in Business Administration",
                "expected_salary": 130000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "Interview",
                "resume_text": "Enterprise AE exceeding quota across $1M+ ACV workforce management software solutions."
            },
            {
                "name": "Liam O'Connor",
                "email": "liam.oc@example.com",
                "phone": "(555) 678-2345",
                "location": "Boston, MA",
                "dept": "Sales",
                "role": "Enterprise Account Executive",
                "experience": 5.0,
                "skills": ["Salesforce", "Customer Success", "Strategic Planning"],
                "education": "Bachelor's Degree",
                "expected_salary": 110000.0,
                "availability": "1 Month",
                "notice_period": "30 days",
                "source": "Agency",
                "status": "Shortlisted",
                "resume_text": "SaaS sales executive focused on mid-market and enterprise expansion accounts."
            },
            {
                "name": "Elena Rostova",
                "email": "elena.r@example.com",
                "phone": "(555) 789-3456",
                "location": "Remote",
                "dept": "Sales",
                "role": "Enterprise Account Executive",
                "experience": 2.0,
                "skills": ["Customer Success", "Salesforce"],
                "education": "Bachelor's Degree",
                "expected_salary": 80000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Direct",
                "status": "Rejected",
                "resume_text": "Sales development representative seeking enterprise executive role."
            },
            {
                "name": "Zane Peterson",
                "email": "zane.p@example.com",
                "phone": "(555) 890-4567",
                "location": "Denver, CO",
                "dept": "Engineering",
                "role": "Senior Software Engineer",
                "experience": 5.5,
                "skills": ["Python", "FastAPI", "SQL", "Docker"],
                "education": "Bachelor's Degree",
                "expected_salary": 115000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "LinkedIn",
                "status": "On Hold",
                "resume_text": "Backend specialist focused on distributed microservices and message queues."
            },
            {
                "name": "Pooja Hegde",
                "email": "pooja.h@example.com",
                "phone": "(555) 901-5678",
                "location": "Remote",
                "dept": "Marketing",
                "role": "Product Marketing Manager",
                "experience": 6.5,
                "skills": ["Product Management", "Campaign Analyst", "Content Strategist", "Figma", "Data Analysis"],
                "education": "Master's Degree",
                "expected_salary": 115000.0,
                "availability": "Immediate",
                "notice_period": "None",
                "source": "Referral",
                "status": "Shortlisted",
                "resume_text": "Senior marketing strategist connecting product telemetry to growth campaigns."
            }
        ]

        for idx, c_data in enumerate(seed_candidates, 1):
            cand_id = f"CAN-{100 + idx:04d}"
            target_role = role_by_dept.get(c_data["dept"])
            
            req_skills = json.loads(target_role.required_skills) if (target_role and target_role.required_skills) else []
            pref_skills = json.loads(target_role.preferred_skills) if (target_role and target_role.preferred_skills) else []

            match_res = calculate_candidate_match(
                candidate_skills=c_data["skills"],
                candidate_experience=c_data["experience"],
                candidate_education=c_data["education"],
                candidate_role=c_data["role"],
                candidate_dept=c_data["dept"],
                candidate_location=c_data["location"],
                role_required_skills=req_skills,
                role_preferred_skills=pref_skills,
                role_min_exp=target_role.min_experience if target_role else 2.0,
                role_max_exp=target_role.max_experience if target_role else 8.0,
                role_education=target_role.education if target_role else "Bachelor's Degree",
                role_title=target_role.title if target_role else c_data["role"],
                role_dept=target_role.department if target_role else c_data["dept"],
                role_location=target_role.location if target_role else "Remote"
            )

            cand = Candidate(
                candidate_id=cand_id,
                name=c_data["name"],
                email=c_data["email"],
                phone=c_data["phone"],
                location=c_data["location"],
                role_id=target_role.id if target_role else None,
                role_title=target_role.title if target_role else c_data["role"],
                department=c_data["dept"],
                experience=c_data["experience"],
                skills=json.dumps(c_data["skills"]),
                education=c_data["education"],
                expected_salary=c_data["expected_salary"],
                availability=c_data["availability"],
                notice_period=c_data["notice_period"],
                source=c_data["source"],
                resume_text=c_data["resume_text"],
                status=c_data["status"],
                match_score=match_res["overall_match_pct"],
                match_breakdown=json.dumps(match_res)
            )
            db.add(cand)
            db.commit()
            db.refresh(cand)

            # Add interview for Interview/Offer status
            if c_data["status"] in ["Interview", "Offer"]:
                inter = Interview(
                    candidate_id=cand.candidate_id,
                    candidate_name=cand.name,
                    role_id=cand.role_id,
                    role_title=cand.role_title,
                    interviewer="NARASIMHA",
                    scheduled_time=(datetime.utcnow() + timedelta(days=idx)).strftime("%d %b %Y, %I:%M %p"),
                    interview_type="Technical & System Design" if cand.department == "Engineering" else "Executive Presentation",
                    status="Completed" if c_data["status"] == "Offer" else "Scheduled",
                    feedback="Candidate demonstrated strong competency and deep strategic alignment." if c_data["status"] == "Offer" else "",
                    rating=4.8 if c_data["status"] == "Offer" else 4.0
                )
                db.add(inter)

            # Add initial note
            note = Note(
                entity_type="candidate",
                entity_id=cand.candidate_id,
                content=f"Candidate reviewed by NARASIMHA. Algorithmic AI Match computed at {cand.match_score}%.",
                author="NARASIMHA"
            )
            db.add(note)

        db.commit()

