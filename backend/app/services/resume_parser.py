import re
from typing import Dict, Any, List

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "FastAPI",
    "Docker", "Kubernetes", "AWS", "Machine Learning", "Data Analysis", "Git",
    "Agile", "Scikit-Learn", "PyTorch", "TensorFlow", "PostgreSQL", "HTML", "CSS",
    "Figma", "Tableau", "PowerBI", "CI/CD", "Java", "C++", "Go", "Pandas",
    "NumPy", "GraphQL", "REST API", "Linux", "Product Management", "Strategic Planning",
    "Recruitment", "HR Analytics", "Talent Acquisition", "Employee Relations",
    "Financial Modeling", "Salesforce", "Customer Success", "Operations Management"
]

def parse_resume_text(text: str, filename: str = "") -> Dict[str, Any]:
    """
    Parses resume text and extracts candidate fields:
    Name, Email, Phone, Skills, Experience, Education, Role.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    full_text_lower = text.lower()

    # 1. Email extraction
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else ""

    # 2. Phone extraction
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else ""

    # 3. Name heuristic (first line that is not an email/phone/url)
    name = ""
    for line in lines[:5]:
        if "@" not in line and not re.search(r'\d{5,}', line) and len(line) < 50:
            clean_name = re.sub(r'[^a-zA-Z\s]', '', line).strip()
            if len(clean_name.split()) >= 2:
                name = clean_name
                break
    if not name:
        name = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title() if filename else "Candidate"

    # 4. Skills extraction
    detected_skills = []
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, full_text_lower):
            detected_skills.append(skill)

    # 5. Experience years extraction
    exp_matches = re.findall(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)?', full_text_lower)
    experience = 2.0
    if exp_matches:
        try:
            nums = [float(m) for m in exp_matches if float(m) < 40]
            if nums:
                experience = max(nums)
        except Exception:
            experience = 3.0

    # 6. Education extraction
    education = "Bachelor's Degree"
    if any(k in full_text_lower for k in ["ph.d", "phd", "doctorate"]):
        education = "Ph.D. in Computer Science"
    elif any(k in full_text_lower for k in ["master", "m.s.", "ms in", "m.tech", "mba"]):
        education = "Master's Degree"
    elif any(k in full_text_lower for k in ["bachelor", "b.s.", "b.tech", "b.e."]):
        education = "Bachelor's in Computer Science"

    # 7. Role heuristic
    role = "Software Engineer"
    if "data scientist" in full_text_lower or "machine learning engineer" in full_text_lower:
        role = "Data Scientist"
    elif "data analyst" in full_text_lower or "bi analyst" in full_text_lower:
        role = "Data Analyst"
    elif "hr" in full_text_lower or "talent" in full_text_lower or "recruiter" in full_text_lower:
        role = "HR Analyst"
    elif "marketing" in full_text_lower:
        role = "Marketing Manager"
    elif "operations" in full_text_lower:
        role = "Operations Manager"

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "role": role,
        "experience": experience,
        "education": education,
        "skills": detected_skills,
        "resume_text": text[:5000]
    }
