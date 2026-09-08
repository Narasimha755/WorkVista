from typing import List, Dict, Any
import pandas as pd

def generate_recommendations(df: pd.DataFrame, predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Synthesizes actionable HR and management recommendations from predictions.
    """
    if df.empty or not predictions:
        return []

    pred_df = pd.DataFrame(predictions)
    merged = pd.merge(df, pred_df, on="employee_id", how="inner", suffixes=('', '_pred'))

    recommendations = []

    # 1. At-Risk 1-on-1s
    at_risk = merged[merged["status"] == "At Risk"]
    at_risk_count = len(at_risk)
    if at_risk_count > 0:
        recommendations.append({
            "id": "rec-at-risk",
            "title": "Schedule one-on-one for at-risk employees",
            "category": "Intervention",
            "affected_count": at_risk_count,
            "potential_impact": "Prevent up to 20% output decline",
            "action_label": "Schedule 1:1",
            "urgency": "high"
        })

    # 2. Overloaded Department Workload Redistribution
    if "department" in merged.columns and "workload" in merged.columns:
        dept_workload = merged.groupby("department")["workload"].mean()
        high_workload_dept = dept_workload.idxmax()
        avg_w = float(dept_workload.max())
        affected_dept_workers = int((merged["department"] == high_workload_dept).sum())
        
        if avg_w > 76.0:
            recommendations.append({
                "id": "rec-workload",
                "title": f"Redistribute workload in {high_workload_dept}",
                "category": "Workload Balance",
                "affected_count": affected_dept_workers,
                "potential_impact": "+12% productivity boost",
                "action_label": "Rebalance Tasks",
                "urgency": "medium"
            })

    # 3. Upskilling / Training for Lower Skill Cohort
    if "skill_level" in merged.columns and "department" in merged.columns:
        dept_skill = merged.groupby("department")["skill_level"].mean()
        low_skill_dept = dept_skill.idxmin()
        skill_count = int(((merged["department"] == low_skill_dept) & (merged["skill_level"] < 70)).sum())
        
        recommendations.append({
            "id": "rec-training",
            "title": f"Provide upskilling for {low_skill_dept} team",
            "category": "Learning & Dev",
            "affected_count": max(12, skill_count),
            "potential_impact": "Accelerate task velocity by 15%",
            "action_label": "Assign Modules",
            "urgency": "medium"
        })

    # 4. Reward Top Performers
    high_performers = merged[merged["status"] == "High"]
    high_count = len(high_performers)
    if high_count > 0:
        recommendations.append({
            "id": "rec-recognition",
            "title": "Recognize and reward top performers",
            "category": "Retention",
            "affected_count": high_count,
            "potential_impact": "Improve retention & team morale",
            "action_label": "View Candidates",
            "urgency": "low"
        })

    return recommendations
