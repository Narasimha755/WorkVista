from app.services.column_mapper import auto_detect_columns

def test_auto_detect_canonical_columns():
    cols = ["emp_id", "Full_Name", "Department_Name", "Work_Output", "Tasks_Done", "Weekly_Hours"]
    mapping, unmapped, confidence = auto_detect_columns(cols)

    assert mapping.get("employee_id") == "emp_id"
    assert mapping.get("employee_name") == "Full_Name"
    assert mapping.get("department") == "Department_Name"
    assert mapping.get("productivity_score") == "Work_Output"
    assert confidence >= 0.75

def test_auto_detect_fallback():
    cols = ["random_col_1", "random_col_2"]
    mapping, unmapped, confidence = auto_detect_columns(cols)
    assert len(unmapped) == 2
    assert confidence == 0.0
