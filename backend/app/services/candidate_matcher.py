from typing import List, Dict, Any, Optional
import json

EDUCATION_LEVELS = {
    "phd": 5,
    "doctorate": 5,
    "master": 4,
    "ms": 4,
    "mba": 4,
    "bachelor": 3,
    "bs": 3,
    "ba": 3,
    "associate": 2,
    "diploma": 2,
    "high school": 1
}

def _parse_education_rank(edu_str: str) -> int:
    s = (edu_str or "").lower()
    for key, rank in EDUCATION_LEVELS.items():
        if key in s:
            return rank
    return 3  # default to bachelor's equivalent

def calculate_candidate_match(
    candidate_skills: List[str],
    candidate_experience: float,
    candidate_education: str,
    candidate_role: str,
    candidate_dept: str,
    candidate_location: str,
    role_required_skills: List[str],
    role_preferred_skills: List[str],
    role_min_exp: float,
    role_max_exp: float,
    role_education: str,
    role_title: str,
    role_dept: str,
    role_location: str
) -> Dict[str, Any]:
    """
    Computes an honest, data-driven AI Match Score (0.0 - 100.0)
    with detailed breakdowns for Skills, Experience, Education, Role, and Location.
    """
    c_skills_clean = set(s.strip().lower() for s in candidate_skills if s)
    req_skills_clean = set(s.strip().lower() for s in role_required_skills if s)
    pref_skills_clean = set(s.strip().lower() for s in role_preferred_skills if s)

    matched_req = c_skills_clean.intersection(req_skills_clean)
    matched_pref = c_skills_clean.intersection(pref_skills_clean)
    all_matched = matched_req.union(matched_pref)
    all_role_skills = req_skills_clean.union(pref_skills_clean)
    missing_skills = list(all_role_skills - c_skills_clean)

    # 1. Skills Match Score (0-100)
    if req_skills_clean:
        req_score = (len(matched_req) / len(req_skills_clean)) * 100.0
    else:
        req_score = 90.0

    if pref_skills_clean:
        pref_score = (len(matched_pref) / len(pref_skills_clean)) * 100.0
    else:
        pref_score = 85.0

    skills_match_pct = round(req_score * 0.75 + pref_score * 0.25, 1)

    # 2. Experience Match Score (0-100)
    c_exp = float(candidate_experience or 0.0)
    min_exp = float(role_min_exp or 1.0)
    max_exp = float(role_max_exp or (min_exp + 5.0))

    if c_exp >= min_exp and c_exp <= max_exp:
        exp_score = 100.0
    elif c_exp > max_exp:
        # slightly overqualified but highly capable
        exp_score = max(80.0, 100.0 - (c_exp - max_exp) * 3.0)
    else:
        # below required minimum
        deficit = min_exp - c_exp
        exp_score = max(30.0, 100.0 - deficit * 20.0)
    experience_match_pct = round(exp_score, 1)

    # 3. Education Match Score (0-100)
    c_rank = _parse_education_rank(candidate_education)
    r_rank = _parse_education_rank(role_education)
    if c_rank >= r_rank:
        edu_score = 100.0
    else:
        edu_score = max(50.0, 100.0 - (r_rank - c_rank) * 25.0)
    education_match_pct = round(edu_score, 1)

    # 4. Role & Department Alignment
    role_match = 100.0 if (role_title.lower() in candidate_role.lower() or candidate_role.lower() in role_title.lower()) else 75.0
    if candidate_dept.lower() == role_dept.lower():
        role_match = min(100.0, role_match + 10.0)
    role_match_pct = round(role_match, 1)

    # 5. Location Match
    c_loc = (candidate_location or "").lower()
    r_loc = (role_location or "").lower()
    if "remote" in r_loc or "remote" in c_loc or c_loc == r_loc:
        loc_match_pct = 100.0
    else:
        loc_match_pct = 70.0

    # Overall Weighted Match
    overall = (
        skills_match_pct * 0.45 +
        experience_match_pct * 0.25 +
        education_match_pct * 0.15 +
        role_match_pct * 0.10 +
        loc_match_pct * 0.05
    )
    overall_match_pct = round(min(99.0, max(25.0, overall)), 1)

    return {
        "skills_match_pct": skills_match_pct,
        "experience_match_pct": experience_match_pct,
        "education_match_pct": education_match_pct,
        "role_match_pct": role_match_pct,
        "location_match_pct": loc_match_pct,
        "overall_match_pct": overall_match_pct,
        "matched_skills": [s.title() for s in sorted(list(all_matched))],
        "missing_skills": [s.title() for s in sorted(list(missing_skills))[:5]]
    }
