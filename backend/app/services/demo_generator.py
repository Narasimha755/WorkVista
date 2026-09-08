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
