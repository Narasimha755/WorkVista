import pandas as pd
from app.services.demo_generator import generate_demo_dataset
from app.ml.pipeline import MLPipeline

def test_ml_pipeline_train_and_predict():
    df = generate_demo_dataset(num_records=100, seed=42)
    pipeline = MLPipeline()

    train_results = pipeline.train(df, target_col="productivity_score", model_type="RandomForest", test_size=0.2)

    assert "r2_score" in train_results["metrics"]
    assert "mae" in train_results["metrics"]
    assert len(train_results["feature_importances"]) > 0
    assert train_results["dataset_size"] == 100

    predictions = pipeline.predict_all(df)
    assert len(predictions) == 100
    for p in predictions:
        assert "predicted_productivity" in p
        assert "change_pct" in p
        assert p["status"] in ["High", "Medium", "Low"]
        assert p["risk_level"] in ["High", "Moderate", "Low"]
        assert len(p["key_factors"]) > 0
