import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

def clean_dataset(df: pd.DataFrame, mapping: Dict[str, str]) -> Tuple[pd.DataFrame, Dict[str, Any], List[str]]:
    """
    Standardizes column names, cleans missing and duplicate values,
    and calculates data quality metrics.
    """
    actions_taken = []
    initial_rows = len(df)
    initial_cols = len(df.columns)

    # Invert mapping to rename actual_col -> canonical_name
    rename_dict = {actual: canonical for canonical, actual in mapping.items()}
    df_clean = df.rename(columns=rename_dict).copy()
    actions_taken.append(f"Mapped {len(rename_dict)} columns to canonical schema.")

    # Calculate initial missing
    missing_count = int(df_clean.isnull().sum().sum())
    missing_pct = round((missing_count / (initial_rows * initial_cols)) * 100, 2) if (initial_rows * initial_cols) > 0 else 0.0

    # Duplicates check
    dup_count = int(df_clean.duplicated().sum())
    if "employee_id" in df_clean.columns:
        dup_ids = int(df_clean["employee_id"].duplicated().sum())
        if dup_ids > 0:
            df_clean = df_clean.drop_duplicates(subset=["employee_id"], keep="first")
            actions_taken.append(f"Removed {dup_ids} duplicate employee ID records.")
    elif dup_count > 0:
        df_clean = df_clean.drop_duplicates(keep="first")
        actions_taken.append(f"Removed {dup_count} duplicate rows.")

    # Generate employee_id if missing
    if "employee_id" not in df_clean.columns:
        df_clean["employee_id"] = [f"EMP-{i+1001}" for i in range(len(df_clean))]
        actions_taken.append("Generated sequential employee IDs.")

    # Generate employee_name if missing
    if "employee_name" not in df_clean.columns:
        df_clean["employee_name"] = [f"Employee {row.get('employee_id', i+1)}" for i, row in df_clean.iterrows()]
        actions_taken.append("Generated placeholder employee names.")

    # Generate department if missing
    if "department" not in df_clean.columns:
        df_clean["department"] = "General"
        actions_taken.append("Assigned default department 'General'.")

    # Numeric percentage columns that should be clamped to 0-100
    pct_cols = [
        "attendance", "workload", "engagement", "skill_level",
        "deadline_adherence", "previous_productivity", "productivity_score"
    ]

    invalid_count = 0

    for col in pct_cols:
        if col in df_clean.columns:
            # Convert to numeric safely
            df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")
            
            # Check if scaled 0.0 - 1.0 instead of 0 - 100
            max_val = df_clean[col].dropna().max() if not df_clean[col].dropna().empty else 0
            if 0 < max_val <= 1.0:
                df_clean[col] = df_clean[col] * 100.0
                actions_taken.append(f"Normalized column '{col}' from [0, 1] to [0, 100] percentage scale.")
            
            # Check for invalid values (<0 or >150)
            invalids = ((df_clean[col] < 0) | (df_clean[col] > 150)).sum()
            invalid_count += int(invalids)
            
            # Impute missing with median
            median_val = df_clean[col].median()
            if pd.isna(median_val):
                median_val = 75.0
            null_count = int(df_clean[col].isnull().sum())
            if null_count > 0:
                df_clean[col] = df_clean[col].fillna(median_val)
                actions_taken.append(f"Imputed {null_count} missing values in '{col}' with median ({median_val:.1f}).")
            
            # Clamp to [0, 100]
            df_clean[col] = df_clean[col].clip(0.0, 100.0).round(1)

    # Specific handling for integer count fields
    int_cols = ["experience", "projects", "tasks_completed", "working_hours"]
    for col in int_cols:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")
            median_val = df_clean[col].median()
            if pd.isna(median_val):
                median_val = 5.0 if col == "experience" else (40.0 if col == "working_hours" else 10.0)
            df_clean[col] = df_clean[col].fillna(median_val).clip(lower=0)

    # Impute categorical fields
    cat_cols = ["role", "performance_rating"]
    for col in cat_cols:
        if col in df_clean.columns:
            mode_val = df_clean[col].mode()
            fill_val = mode_val.iloc[0] if not mode_val.empty else "Standard"
            df_clean[col] = df_clean[col].fillna(fill_val).astype(str)

    # Ensure productivity_score exists
    if "productivity_score" not in df_clean.columns:
        if "previous_productivity" in df_clean.columns:
            df_clean["productivity_score"] = df_clean["previous_productivity"]
        else:
            # Synthetic realistic score from engagement and attendance
            eng = df_clean.get("engagement", 75.0)
            att = df_clean.get("attendance", 90.0)
            df_clean["productivity_score"] = ((eng * 0.4 + att * 0.6)).clip(40, 98).round(1)
        actions_taken.append("Derived baseline productivity score from available metrics.")

    # Quality Score Calculation
    invalid_pct = (invalid_count / (initial_rows * max(1, len(pct_cols)))) * 100
    quality_score = max(15.0, round(100.0 - (missing_pct * 1.5) - (dup_count * 2.0) - (invalid_pct * 1.2), 1))

    # Detect feature types
    num_features = int(df_clean.select_dtypes(include=[np.number]).shape[1])
    cat_features = int(df_clean.select_dtypes(include=['object', 'category']).shape[1])

    stats = {
        "total_rows": len(df_clean),
        "total_columns": len(df_clean.columns),
        "missing_values_count": missing_count,
        "missing_values_pct": missing_pct,
        "duplicate_rows": dup_count,
        "numeric_features_count": num_features,
        "categorical_features_count": cat_features,
        "quality_score": quality_score
    }

    return df_clean, stats, actions_taken
