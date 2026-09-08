import os
import json
import time
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
import joblib

from app.core.config import settings, MODELS_DIR

FACTOR_COLORS = {
    "workload": "#10B981", # Emerald green
    "skill_level": "#3B82F6", # Blue
    "attendance": "#8B5CF6", # Purple
    "engagement": "#F59E0B", # Amber
    "experience": "#06B6D4", # Cyan
    "deadline_adherence": "#EC4899", # Pink
    "working_hours": "#6366F1", # Indigo
    "projects": "#14B8A6", # Teal
    "previous_productivity": "#3B82F6",
    "department": "#8B5CF6"
}

FRIENDLY_NAMES = {
    "workload": "Workload Balance",
    "skill_level": "Skill Proficiency",
    "attendance": "Attendance Rate",
    "engagement": "Engagement Score",
    "experience": "Experience & Tenure",
    "deadline_adherence": "Project Complexity / Deadlines",
    "working_hours": "Working Hours",
    "projects": "Active Projects",
    "tasks_completed": "Completed Tasks",
    "previous_productivity": "Historical Output",
    "department": "Department Alignment"
}

class MLPipeline:
    def __init__(self):
        self.model = None
        self.model_type = "RandomForest"
        self.task_type = "regression"
        self.feature_names = []
        self.feature_importances = []
        self.scaler = None
        self.target_column = "productivity_score"
        self.metrics = {}

    def prepare_data(self, df: pd.DataFrame, target_col: str = "productivity_score") -> Tuple[pd.DataFrame, pd.Series, List[str]]:
        self.target_column = target_col
        # Drop non-predictive identity columns
        drop_cols = [c for c in ["id", "employee_id", "employee_name", "performance_rating", target_col] if c in df.columns]
        
        X_raw = df.drop(columns=drop_cols)
        y = df[target_col]

        # One-hot encode categorical features (like department, role)
        cat_cols = X_raw.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = X_raw.select_dtypes(include=[np.number]).columns.tolist()

        if cat_cols:
            X_encoded = pd.get_dummies(X_raw, columns=cat_cols, drop_first=True)
        else:
            X_encoded = X_raw.copy()

        # Fill any remaining NaNs
        X_encoded = X_encoded.fillna(X_encoded.median(numeric_only=True))

        return X_encoded, y, num_cols

    def train(
        self, 
        df: pd.DataFrame, 
        target_col: str = "productivity_score", 
        model_type: str = "RandomForest",
        test_size: float = 0.2
    ) -> Dict[str, Any]:
        start_time = time.time()
        self.model_type = model_type
        
        # Determine task type
        target_series = df[target_col]
        is_discrete = (target_series.dtype == 'object') or (len(target_series.unique()) <= 5 and not np.issubdtype(target_series.dtype, np.floating))
        self.task_type = "classification" if is_discrete else "regression"

        X, y, num_cols = self.prepare_data(df, target_col)
        self.feature_names = X.columns.tolist()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=settings.RANDOM_STATE
        )

        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Instantiate algorithm
        if self.task_type == "regression":
            if model_type == "GradientBoosting":
                self.model = GradientBoostingRegressor(n_estimators=100, random_state=settings.RANDOM_STATE)
                self.model.fit(X_train, y_train) # Tree models work well on unscaled
                y_pred = self.model.predict(X_test)
                raw_importances = self.model.feature_importances_
            elif model_type in ["LinearRegression", "Ridge"]:
                self.model = Ridge(alpha=1.0) if model_type == "Ridge" else LinearRegression()
                self.model.fit(X_train_scaled, y_train)
                y_pred = self.model.predict(X_test_scaled)
                raw_importances = np.abs(self.model.coef_)
            else: # Default RandomForest
                self.model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=settings.RANDOM_STATE)
                self.model.fit(X_train, y_train)
                y_pred = self.model.predict(X_test)
                raw_importances = self.model.feature_importances_

            # Compute Regression Metrics
            r2 = float(r2_score(y_test, y_pred))
            mae = float(mean_absolute_error(y_test, y_pred))
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            mape_val = float(np.mean(np.abs((y_test - y_pred) / np.maximum(y_test, 1)))) * 100

            self.metrics = {
                "r2_score": round(r2, 4),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "mape": round(mape_val, 2),
                "accuracy": None
            }
        else: # Classification
            if model_type == "GradientBoosting":
                self.model = GradientBoostingClassifier(n_estimators=100, random_state=settings.RANDOM_STATE)
                self.model.fit(X_train, y_train)
                y_pred = self.model.predict(X_test)
                raw_importances = self.model.feature_importances_
            elif model_type == "LogisticRegression":
                self.model = LogisticRegression(max_iter=1000)
                self.model.fit(X_train_scaled, y_train)
                y_pred = self.model.predict(X_test_scaled)
                raw_importances = np.mean(np.abs(self.model.coef_), axis=0) if len(self.model.coef_.shape) > 1 else np.abs(self.model.coef_)
            else:
                self.model = RandomForestClassifier(n_estimators=100, random_state=settings.RANDOM_STATE)
                self.model.fit(X_train, y_train)
                y_pred = self.model.predict(X_test)
                raw_importances = self.model.feature_importances_

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
            rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

            self.metrics = {
                "accuracy": round(acc * 100.0, 1),
                "precision_score": round(prec * 100.0, 1),
                "recall_score": round(rec * 100.0, 1),
                "f1_score": round(f1 * 100.0, 1),
                "r2_score": round(acc, 4)
            }

        # Aggregate feature importances back to parent base columns
        parent_importances: Dict[str, float] = {}
        total_importance = sum(raw_importances) if sum(raw_importances) > 0 else 1.0

        for feat_name, imp in zip(self.feature_names, raw_importances):
            # If one-hot encoded (e.g. department_Engineering), parent is department
            base_col = feat_name.split('_')[0] if any(feat_name.startswith(p + '_') for p in ['department', 'role']) else feat_name
            parent_importances[base_col] = parent_importances.get(base_col, 0.0) + (imp / total_importance)

        # Format sorted feature importances
        sorted_factors = sorted(parent_importances.items(), key=lambda x: x[1], reverse=True)
        self.feature_importances = [
            {
                "name": FRIENDLY_NAMES.get(k, k.replace('_', ' ').title()),
                "raw_key": k,
                "importance_pct": round(v * 100.0, 1),
                "color": FACTOR_COLORS.get(k, "#3B82F6")
            }
            for k, v in sorted_factors if v > 0.01
        ]

        # Actual vs Predicted scatter sample & Residuals
        scatter_sample = []
        residuals_list = []
        if self.task_type == "regression":
            sample_size = min(60, len(y_test))
            y_test_arr = np.array(y_test)[:sample_size]
            y_pred_arr = np.array(y_pred)[:sample_size]
            for act, prd in zip(y_test_arr, y_pred_arr):
                act_val = round(float(act), 1)
                prd_val = round(float(prd), 1)
                scatter_sample.append({"actual": act_val, "predicted": prd_val})
                residuals_list.append(round(act_val - prd_val, 1))

        training_duration = round(time.time() - start_time, 2)

        # Save model artifact
        model_filename = f"{model_type}_{self.task_type}_{int(time.time())}.joblib"
        model_path = str(MODELS_DIR / model_filename)
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "feature_names": self.feature_names,
            "feature_importances": self.feature_importances,
            "task_type": self.task_type,
            "metrics": self.metrics
        }, model_path)

        return {
            "model_type": model_type,
            "task_type": self.task_type,
            "metrics": self.metrics,
            "dataset_size": len(df),
            "features_count": len(self.feature_names),
            "feature_importances": self.feature_importances,
            "training_duration_sec": training_duration,
            "actual_vs_predicted_scatter": scatter_sample,
            "residuals": residuals_list,
            "model_path": model_path
        }

    def predict_all(
        self, 
        df: pd.DataFrame, 
        high_threshold: float = 80.0, 
        medium_threshold: float = 50.0,
        risk_threshold: float = 50.0
    ) -> List[Dict[str, Any]]:
        """
        Generates individual predictions, risk scores, status, and AI explanations.
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet.")

        X, _, _ = self.prepare_data(df, self.target_column)
        
        # Ensure all columns match training feature names
        for col in self.feature_names:
            if col not in X.columns:
                X[col] = 0
        X = X[self.feature_names]

        # Predict
        if self.model_type in ["LinearRegression", "Ridge", "LogisticRegression"] and self.scaler is not None:
            X_scaled = self.scaler.transform(X)
            raw_preds = self.model.predict(X_scaled)
        else:
            raw_preds = self.model.predict(X)

        predictions_result = []

        # Calculate feature means and stds for local SHAP-like attribution
        feat_means = X.mean()
        feat_stds = X.std().replace(0, 1.0)
        top_factor_weights = {f["raw_key"]: f["importance_pct"] for f in self.feature_importances}

        for idx, row in df.iterrows():
            emp_id = row.get("employee_id", f"EMP-{idx}")
            current_prod = float(row.get("productivity_score", 70.0))
            predicted_prod = float(raw_preds[idx]) if idx < len(raw_preds) else current_prod
            predicted_prod = round(max(30.0, min(99.5, predicted_prod)), 1)

            change_pct = round(((predicted_prod - current_prod) / max(1.0, current_prod)) * 100.0, 1)

            attendance = float(row.get("attendance", 90.0))
            workload = float(row.get("workload", 70.0))
            engagement = float(row.get("engagement", 75.0))

            # Risk Score calculation
            burnout_penalty = max(0.0, workload - 76.0) * 1.2
            low_attendance_penalty = max(0.0, 88.0 - attendance) * 1.5
            drop_penalty = max(0.0, current_prod - predicted_prod) * 2.0
            fatigue_penalty = max(0.0, 72.0 - engagement) * 1.0
            
            raw_risk = (100.0 - predicted_prod) * 0.55 + burnout_penalty + low_attendance_penalty + drop_penalty + fatigue_penalty
            risk_score = round(min(98.0, max(5.0, raw_risk)), 1)

            # Performance status: High (>= high_threshold), Medium (50-79), Low (< medium_threshold)
            if predicted_prod >= high_threshold:
                status = "High"
            elif predicted_prod < medium_threshold:
                status = "Low"
            else:
                status = "Medium"

            # Quantitative Risk Level: High (>= 70), Moderate (30-69), Low (< 30)
            if risk_score >= 70.0:
                risk_level = "High"
            elif risk_score >= 30.0:
                risk_level = "Moderate"
            else:
                risk_level = "Low"

            # Confidence score based on model R2 / accuracy and prediction delta
            if self.task_type == "regression":
                r2_val = self.metrics.get("r2_score") or 0.85
                fit_base = max(75.0, min(96.0, r2_val * 100.0))
            else:
                fit_base = self.metrics.get("accuracy") or 90.0
            confidence = round(min(98.0, max(75.0, fit_base - abs(change_pct) * 0.15)), 1)

            # Local feature impact explanation
            x_row = X.iloc[idx]
            factors = []
            for base_factor, weight in top_factor_weights.items():
                matching_cols = [c for c in X.columns if c == base_factor or c.startswith(base_factor + '_')]
                if not matching_cols:
                    continue
                col_name = matching_cols[0]
                z_score = (x_row[col_name] - feat_means[col_name]) / feat_stds[col_name]
                impact = round(min(25.0, max(-25.0, z_score * (weight * 0.4))), 1)
                
                direction = "positive" if impact >= 0 else "negative"
                friendly_name = FRIENDLY_NAMES.get(base_factor, base_factor.replace('_', ' ').title())
                
                desc = f"{friendly_name} {'exceeds' if impact > 0 else 'lags'} cohort baseline"
                factors.append({
                    "factor": friendly_name,
                    "impact_pct": abs(impact),
                    "direction": direction,
                    "description": desc
                })

            # Sort by highest absolute impact
            factors.sort(key=lambda x: x["impact_pct"], reverse=True)

            predictions_result.append({
                "employee_id": emp_id,
                "current_productivity": current_prod,
                "predicted_productivity": predicted_prod,
                "change_pct": change_pct,
                "status": status,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence_score": confidence,
                "key_factors": factors[:4]
            })

        return predictions_result

ml_pipeline = MLPipeline()
