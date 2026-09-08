import pandas as pd
from app.services.data_cleaner import clean_dataset

def test_clean_dataset_missing_and_duplicates():
    raw_data = {
        "Emp ID": ["EMP-001", "EMP-002", "EMP-002", "EMP-003"],
        "Staff Name": ["Alice", "Bob", "Bob", None],
        "Dept": ["Engineering", "Marketing", "Marketing", "HR"],
        "Prod": [85.0, 72.0, 72.0, None],
        "Att": [0.95, 0.88, 0.88, 0.75] # Scaled [0, 1]
    }
    df = pd.DataFrame(raw_data)
    mapping = {
        "employee_id": "Emp ID",
        "employee_name": "Staff Name",
        "department": "Dept",
        "productivity_score": "Prod",
        "attendance": "Att"
    }

    df_clean, stats, actions = clean_dataset(df, mapping)

    # Duplicate EMP-002 should be removed
    assert stats["total_rows"] == 3
    assert "employee_id" in df_clean.columns
    assert "attendance" in df_clean.columns
    # Scaled attendance should be clamped to [0, 100]
    assert df_clean["attendance"].max() <= 100.0
    assert df_clean["attendance"].min() >= 0.0
    # Imputed productivity
    assert not df_clean["productivity_score"].isnull().any()
    assert stats["quality_score"] > 50.0
