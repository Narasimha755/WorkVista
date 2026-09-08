from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.models import Employee, Prediction, Department

router = APIRouter()

class ScenarioSimulateRequest(BaseModel):
    workload_delta_pct: float = Field(0.0, description="Percentage adjustment to workload, e.g. -10 for 10% reduction")
    attendance_delta_pct: float = Field(0.0, description="Percentage adjustment to attendance adherence, e.g. +5")
    engagement_delta_pct: float = Field(0.0, description="Percentage adjustment to engagement initiatives, e.g. +8")
    training_uplift_pct: float = Field(0.0, description="Percentage adjustment to skill development/training, e.g. +10")
    target_department: Optional[str] = Field("All", description="Target department or 'All'")

class DepartmentScenarioImpact(BaseModel):
    department: str = Field(..., alias="department")
    baseline_output: float
    simulated_output: float
    delta_output: float
    baseline_at_risk: int
    simulated_at_risk: int
    at_risk_reduction: int
    capacity_status: str

class ScenarioSimulateResponse(BaseModel):
    scenario_name: str
    target_scope: str
    baseline_avg_productivity: float
    simulated_avg_productivity: float
    productivity_delta: float
    baseline_at_risk_count: int
    simulated_at_risk_count: int
    at_risk_reduction: int
    baseline_high_performers: int
    simulated_high_performers: int
    high_performer_gain: int
    baseline_health_score: int
    simulated_health_score: int
    health_score_delta: int
    executive_summary: str
    department_impacts: List[Dict[str, Any]]
    policy_recommendations: List[str]

@router.post("/scenario/simulate", response_model=ScenarioSimulateResponse)
def simulate_workforce_scenario(request: ScenarioSimulateRequest, db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    predictions = db.query(Prediction).all()
    departments = db.query(Department).all()

    if not employees:
        raise HTTPException(status_code=400, detail="No employee records found to simulate.")

    pred_map = {p.employee_id: p for p in predictions}

    # Filter by target department if specified
    target_dept = request.target_department or "All"
    target_emps = [e for e in employees if (target_dept == "All" or e.department == target_dept)]

    # Compute baseline metrics
    baseline_prod_list = [e.productivity_score for e in employees]
    baseline_avg_prod = round(sum(baseline_prod_list) / len(baseline_prod_list), 1)

    baseline_at_risk = 0
    baseline_high = 0
    for e in employees:
        p = pred_map.get(e.employee_id)
        r_score = p.risk_score if p and p.risk_score is not None else 0.0
        if r_score >= 60 or (p and p.risk_level == "High"):
            baseline_at_risk += 1
        if e.productivity_score >= 80:
            baseline_high += 1

    baseline_health = 82 # standard baseline composite

    # Simulate impacts on each employee
    simulated_records = []
    simulated_at_risk = 0
    simulated_high = 0

    wl_adj = request.workload_delta_pct / 100.0
    att_adj = request.attendance_delta_pct / 100.0
    eng_adj = request.engagement_delta_pct / 100.0
    trn_adj = request.training_uplift_pct / 100.0

    for e in employees:
        is_target = (target_dept == "All" or e.department == target_dept)
        p = pred_map.get(e.employee_id)
        current_p = e.productivity_score
        current_r = p.risk_score if p and p.risk_score is not None else 25.0

        if is_target:
            # 1. Workload impact: excessive workload (>70) benefits significantly from reduction
            # Overload strain relief
            wl_relief = 0.0
            if wl_adj < 0: # reducing workload
                if (e.workload or 0) > 70 or (e.working_hours or 0) > 40:
                    wl_relief = abs(wl_adj) * 12.0 # up to +1.2% - +2.4% gain from burnout reduction
                else:
                    wl_relief = abs(wl_adj) * 4.0
            elif wl_adj > 0: # increasing workload can cause minor strain
                wl_relief = -(wl_adj * 8.0)

            # 2. Attendance improvement: direct positive multiplier
            att_gain = att_adj * 18.0

            # 3. Engagement improvement: direct cultural multiplier
            eng_gain = eng_adj * 16.0

            # 4. Training / Skill uplift: compounding capability
            trn_gain = trn_adj * 14.0

            total_delta = wl_relief + att_gain + eng_gain + trn_gain
            new_p = min(99.0, max(45.0, round(current_p + total_delta, 1)))

            # Risk impact
            # Workload reduction and engagement boost significantly depress flight risk
            risk_relief = (abs(wl_adj) * 25.0 if wl_adj < 0 else 0) + (eng_adj * 35.0) + (att_adj * 10.0)
            new_r = max(5.0, min(95.0, round(current_r - risk_relief, 1)))
        else:
            new_p = current_p
            new_r = current_r

        simulated_records.append({
            "employee_id": e.employee_id,
            "department": e.department,
            "baseline_p": current_p,
            "simulated_p": new_p,
            "baseline_r": current_r,
            "simulated_r": new_r
        })

        if new_r >= 60:
            simulated_at_risk += 1
        if new_p >= 80:
            simulated_high += 1

    sim_avg_prod = round(sum(s["simulated_p"] for s in simulated_records) / len(simulated_records), 1)
    prod_delta = round(sim_avg_prod - baseline_avg_prod, 1)
    risk_reduction = baseline_at_risk - simulated_at_risk
    high_gain = simulated_high - baseline_high

    # Simulated health score
    health_delta = int(round(prod_delta * 1.5 + risk_reduction * 1.2))
    sim_health = min(98, max(50, baseline_health + health_delta))

    # Department breakdown
    dept_names = sorted(list(set(e.department for e in employees if e.department)))
    dept_impacts = []
    for d_name in dept_names:
        d_sims = [s for s in simulated_records if s["department"] == d_name]
        if d_sims:
            d_base = round(sum(s["baseline_p"] for s in d_sims) / len(d_sims), 1)
            d_sim = round(sum(s["simulated_p"] for s in d_sims) / len(d_sims), 1)
            d_base_risk = sum(1 for s in d_sims if s["baseline_r"] >= 60)
            d_sim_risk = sum(1 for s in d_sims if s["simulated_r"] >= 60)
            
            # Capacity status
            if d_name == "Operations" and wl_adj >= 0:
                cap_st = "Over-Capacity"
            elif d_name == "HR" and wl_adj <= 0:
                cap_st = "Under-Capacity"
            else:
                cap_st = "Balanced"

            dept_impacts.append({
                "department": d_name,
                "baseline_output": d_base,
                "simulated_output": d_sim,
                "delta_output": round(d_sim - d_base, 1),
                "baseline_at_risk": d_base_risk,
                "simulated_at_risk": d_sim_risk,
                "at_risk_reduction": d_base_risk - d_sim_risk,
                "capacity_status": cap_st
            })

    # Summary and policy guidance
    scenario_desc = []
    if request.workload_delta_pct != 0:
        scenario_desc.append(f"{request.workload_delta_pct:+g}% Workload Adjustment")
    if request.training_uplift_pct != 0:
        scenario_desc.append(f"+{request.training_uplift_pct:g}% Skill Development")
    if request.attendance_delta_pct != 0:
        scenario_desc.append(f"+{request.attendance_delta_pct:g}% Attendance Adherence")
    if request.engagement_delta_pct != 0:
        scenario_desc.append(f"+{request.engagement_delta_pct:g}% Engagement Initiative")

    scenario_name = ", ".join(scenario_desc) if scenario_desc else "Standard Baseline Policy"

    summary_text = (
        f"Simulating {scenario_name} across {target_dept} workforce projects an overall productivity shift of "
        f"{'+' if prod_delta >= 0 else ''}{prod_delta}% (from {baseline_avg_prod}% to {sim_avg_prod}%). "
        f"Flight risk exposure decreases by {risk_reduction} employees (from {baseline_at_risk} to {simulated_at_risk}), "
        f"while high performers increase by +{high_gain} staff. Composite Workforce Health improves by +{health_delta} points to {sim_health}/100."
    )

    policy_recs = [
        "Prioritize workload redistribution in Operations before executing company-wide adjustments.",
        "Pair skill enablement programs with project-based milestones to lock in predicted output gains.",
        "Maintain weekly check-ins with retained at-risk staff during the transition cycle."
    ]

    return ScenarioSimulateResponse(
        scenario_name=scenario_name,
        target_scope=target_dept,
        baseline_avg_productivity=baseline_avg_prod,
        simulated_avg_productivity=sim_avg_prod,
        productivity_delta=prod_delta,
        baseline_at_risk_count=baseline_at_risk,
        simulated_at_risk_count=simulated_at_risk,
        at_risk_reduction=risk_reduction,
        baseline_high_performers=baseline_high,
        simulated_high_performers=simulated_high,
        high_performer_gain=high_gain,
        baseline_health_score=baseline_health,
        simulated_health_score=sim_health,
        health_score_delta=health_delta,
        executive_summary=summary_text,
        department_impacts=dept_impacts,
        policy_recommendations=policy_recs
    )
