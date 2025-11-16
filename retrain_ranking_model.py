"""
Retrain Ranking Model with Direct Priority Metrics
This script retrains the ranking model to naturally prioritize:
- Stars, Watchers, Forks, Commits, and Recency
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from xgboost import XGBRegressor
import joblib

# ============================================================================
# STEP 1: Load Your GitHub User Data
# ============================================================================
print("📂 Loading data...")

# Load the training data collected by collect_training_data.py
try:
    df = pd.read_csv('github_training_data.csv')
    print("✅ Data loaded from github_training_data.csv!")
except FileNotFoundError:
    print("❌ ERROR: github_training_data.csv not found!")
    print("\n📝 Please run: python collect_training_data.py first")
    print("   This will collect GitHub data and create the training dataset.")
    exit(1)

print(f"   Shape: {df.shape}")
print(f"   Columns: {list(df.columns)}")

# Verify required columns exist
required_cols = ['stars', 'watchers', 'forks', 'total_commits', 'days_since_update']
missing_cols = [col for col in required_cols if col not in df.columns]

if missing_cols:
    print(f"\n❌ ERROR: Missing required columns: {missing_cols}")
    print("   Please ensure github_training_data.csv has all required columns.")
    exit(1)

print(f"✅ All required columns present: {required_cols}")

# ============================================================================
# STEP 2: Create NEW Rank Target with Your Priorities
# ============================================================================
print("\n🎯 Creating new rank_target with priority metrics...")

def robust01(x):
    """Normalize to 0-1 range using robust scaling"""
    q25, q75 = x.quantile([0.25, 0.75])
    iqr = q75 - q25
    if iqr == 0:
        return (x - x.min()) / (x.max() - x.min() + 1e-9)
    return np.clip((x - q25) / (iqr * 1.5), 0, 1)

# Normalize each priority metric
normalized_stars = robust01(df['stars'])
normalized_watchers = robust01(df['watchers'])
normalized_forks = robust01(df['forks'])
normalized_commits = robust01(df['total_commits'])

# Recency score (higher = more recent)
# Invert days_since_update so recent repos score higher
df['recency_score'] = 1.0 / (1.0 + df['days_since_update'] / 30.0)
normalized_recency = robust01(df['recency_score'])

# Calculate NEW rank_target with YOUR priority weights
NEW_WEIGHTS = {
    'stars': 0.35,         # 35% - Highest priority!
    'forks': 0.25,         # 25% - Second priority
    'watchers': 0.15,      # 15% - Third priority
    'commits': 0.15,       # 15% - Development effort
    'recency': 0.10,       # 10% - Recent activity bonus
}

df['rank_target'] = (
    NEW_WEIGHTS['stars'] * normalized_stars +
    NEW_WEIGHTS['forks'] * normalized_forks +
    NEW_WEIGHTS['watchers'] * normalized_watchers +
    NEW_WEIGHTS['commits'] * normalized_commits +
    NEW_WEIGHTS['recency'] * normalized_recency
)

print("✅ New rank_target created!")
print(f"   Weights: {NEW_WEIGHTS}")
print(f"   Target stats - Mean: {df['rank_target'].mean():.4f}, Std: {df['rank_target'].std():.4f}")
print(f"   Target range: [{df['rank_target'].min():.4f}, {df['rank_target'].max():.4f}]")

# ============================================================================
# STEP 3: Prepare Features
# ============================================================================
print("\n🔧 Preparing features...")

# Drop target and ID columns
drop_cols = ['rank_target', 'recency_score']
if 'id' in df.columns:
    drop_cols.append('id')

X = df.drop(columns=[c for c in drop_cols if c in df.columns]).copy()
y = df['rank_target'].values

print(f"✅ Features prepared!")
print(f"   Features: {X.shape[1]}")
print(f"   Samples: {X.shape[0]}")

# ============================================================================
# STEP 4: Split Data
# ============================================================================
print("\n✂️ Splitting data...")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"✅ Split completed!")
print(f"   Training: {X_train.shape}")
print(f"   Test: {X_test.shape}")

# ============================================================================
# STEP 5: Create and Train Pipeline
# ============================================================================
print("\n🚀 Training XGBoost Ranker with new target...")

# Get numeric columns
num_features = list(X.columns)

# Preprocessing pipeline
preprocessor = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler(with_mean=False))
    ]), num_features)
])

# XGBoost with optimized parameters for your priorities
xgb_model = XGBRegressor(
    objective="reg:squarederror",
    tree_method="hist",
    n_estimators=600,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    importance_type='gain'
)

# Complete pipeline
pipeline = Pipeline([
    ("prep", preprocessor),
    ("model", xgb_model)
])

# Train the model
pipeline.fit(X_train, y_train)

print("✅ Training completed!")

# ============================================================================
# STEP 6: Evaluate Model
# ============================================================================
print("\n📊 Evaluating model...")

from sklearn.metrics import mean_squared_error, r2_score

y_pred = pipeline.predict(X_test)

rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

print(f"✅ Evaluation Results:")
print(f"   RMSE: {rmse:.4f}")
print(f"   R² Score: {r2:.4f}")

# Show feature importance
print("\n🎯 Top 10 Most Important Features:")
feature_importance = xgb_model.feature_importances_
feature_names = X.columns
importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': feature_importance
}).sort_values('importance', ascending=False).head(10)

print(importance_df.to_string(index=False))

# ============================================================================
# STEP 7: Save the Retrained Model
# ============================================================================
print("\n💾 Saving model...")

# Save to the models directory
joblib.dump(pipeline, 'organized_structure/models/ranking_xgboost.pkl')

print("✅ Model saved to: organized_structure/models/ranking_xgboost.pkl")

# ============================================================================
# STEP 8: Test Predictions
# ============================================================================
print("\n🧪 Testing predictions on sample repos...")

# Get top 10 by true scores
top_indices = np.argsort(y_test)[-10:][::-1]

print("\nTop 10 Repositories by New Ranking:")
print("-" * 80)
for i, idx in enumerate(top_indices, 1):
    true_score = y_test[idx]
    pred_score = y_pred[idx]
    print(f"{i}. True: {true_score:.3f} | Predicted: {pred_score:.3f} | Diff: {abs(true_score-pred_score):.3f}")

print("\n" + "="*80)
print("✅ RETRAINING COMPLETE!")
print("="*80)
print("\n📝 Next Steps:")
print("1. Remove the hardcoded priority scoring from generate_portfolio_improved.py")
print("2. Use ONLY the model predictions (base_scores)")
print("3. Your model now naturally understands: Stars > Forks > Watchers > Commits > Recency")
print("\n🎯 The model has learned your priorities!")

