import re
from typing import Dict, List, Tuple

CANONICAL_COLUMNS = {
    "employee_id": [
        "employee_id", "empid", "emp_id", "id", "staff_id", "worker_id", "employeeid", "badge_number"
    ],
    "employee_name": [
        "employee_name", "name", "full_name", "emp_name", "employeename", "worker_name", "staff_name"
    ],
    "department": [
        "department", "dept", "division", "team", "business_unit", "unit", "dept_name"
    ],
    "role": [
        "role", "job_title", "title", "position", "designation", "job_role"
    ],
    "experience": [
        "experience", "tenure", "exp", "years_experience", "years_of_experience", "experience_years"
    ],
    "attendance": [
        "attendance", "attendance_rate", "attendance_pct", "presence_ratio", "attendance_score"
    ],
    "workload": [
        "workload", "workload_score", "tasks", "task_load", "workload_balance"
    ],
    "working_hours": [
        "working_hours", "hours_worked", "work_hours", "weekly_hours", "avg_hours"
    ],
    "engagement": [
        "engagement", "engagement_score", "satisfaction", "employee_engagement", "engagement_rate"
    ],
    "skill_level": [
        "skill_level", "skill_score", "skills", "skill_proficiency", "skill_index"
    ],
    "projects": [
        "projects", "project_count", "active_projects", "num_projects"
    ],
    "tasks_completed": [
        "tasks_completed", "completed_tasks", "tasks_done", "tasks_finished"
    ],
    "deadline_adherence": [
        "deadline_adherence", "on_time_delivery", "deadline_pct", "delivery_rate"
    ],
    "previous_productivity": [
        "previous_productivity", "prev_productivity", "last_month_productivity", "past_productivity", "baseline_productivity"
    ],
    "productivity_score": [
        "productivity", "productivity_score", "performance", "work_output", "current_productivity", "actual_output", "output_score"
    ],
    "performance_rating": [
        "performance_rating", "rating", "performance_level", "rating_category"
    ]
}

def clean_column_name(col: str) -> str:
    cleaned = col.strip().lower()
    cleaned = re.sub(r'[\s\-_./\\]+', '_', cleaned)
    cleaned = re.sub(r'[^a-z0-9_]', '', cleaned)
    return cleaned

def auto_detect_columns(actual_columns: List[str]) -> Tuple[Dict[str, str], List[str], float]:
    """
    Returns:
      mapping: canonical_name -> actual_col_name
      unmapped: list of actual columns not mapped
      confidence_score: 0.0 to 1.0
    """
    mapping: Dict[str, str] = {}
    used_actual = set()
    cleaned_actual = {col: clean_column_name(col) for col in actual_columns}

    # Pass 1: exact clean match
    for canonical, aliases in CANONICAL_COLUMNS.items():
        if canonical in mapping:
            continue
        for actual, cleaned in cleaned_actual.items():
            if actual in used_actual:
                continue
            if cleaned in [clean_column_name(a) for a in aliases]:
                mapping[canonical] = actual
                used_actual.add(actual)
                break

    # Pass 2: substring match for unmapped
    for canonical, aliases in CANONICAL_COLUMNS.items():
        if canonical in mapping:
            continue
        for actual, cleaned in cleaned_actual.items():
            if actual in used_actual:
                continue
            for alias in aliases:
                alias_clean = clean_column_name(alias)
                if alias_clean in cleaned or cleaned in alias_clean:
                    mapping[canonical] = actual
                    used_actual.add(actual)
                    break
            if canonical in mapping:
                break

    unmapped = [col for col in actual_columns if col not in used_actual]

    # Required fields for valid workforce prediction
    essential_fields = ["employee_id", "employee_name", "department", "productivity_score"]
    essential_matches = sum(1 for field in essential_fields if field in mapping)
    confidence_score = essential_matches / len(essential_fields)

    return mapping, unmapped, confidence_score
