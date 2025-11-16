# 📊 Train/Validation/Test Split Strategy

## Why Train/Val/Test is Better

### ❌ Train/Test Only (Old Approach)
```
Train: 80% → Training
Test:  20% → Tuning + Final Evaluation
```

**Problems:**
- Can't tune hyperparameters without "peeking" at test set
- Risk of overfitting to test set during development
- Test performance may be optimistic
- No proper early stopping

### ✅ Train/Val/Test (New Approach)
```
Train:      60% → Model training
Validation: 20% → Hyperparameter tuning, early stopping
Test:       20% → Final evaluation (never touched during training)
```

**Benefits:**
- ✅ Proper hyperparameter tuning on validation set
- ✅ Early stopping without test set leakage
- ✅ Test set remains truly unseen
- ✅ Honest performance estimates
- ✅ Better generalization

---

## Implementation

### Data Split Strategy

```python
# Step 1: Split into train+val (80%) and test (20%)
X_trainval, X_test, y_trainval, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Step 2: Split train+val into train (60% of total) and val (20% of total)
X_train, X_val, y_train, y_val = train_test_split(
    X_trainval, y_trainval, test_size=0.25, random_state=42
)

# Result:
# Train: 60% (0.8 * 0.75)
# Val:   20% (0.8 * 0.25)
# Test:  20%
```

### Using Validation Set

**1. Early Stopping:**
```python
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    early_stopping_rounds=50,  # Stop if no improvement for 50 rounds
    verbose=False
)
```

**2. Hyperparameter Tuning:**
```python
# Try different hyperparameters
for lr in [0.01, 0.05, 0.1]:
    model.set_params(learning_rate=lr)
    model.fit(X_train, y_train)
    val_score = model.score(X_val, y_val)
    # Choose best based on validation score
```

**3. Model Selection:**
```python
# Compare multiple models on validation set
models = [XGBoost(), RandomForest(), LightGBM()]
for model in models:
    model.fit(X_train, y_train)
    val_score = model.score(X_val, y_val)
    # Pick best performer on validation
```

---

## Best Practices

### 1. **Never Touch Test Set During Development**
```python
# ✅ GOOD: Tune on validation
best_params = tune_hyperparameters(X_train, X_val, y_train, y_val)

# ❌ BAD: Tune on test
best_params = tune_hyperparameters(X_train, X_test, y_train, y_test)
```

### 2. **Use Validation for Monitoring**
```python
# ✅ GOOD: Monitor validation loss
for epoch in range(100):
    train_loss = train_step()
    val_loss = validate_step()  # Check validation
    if val_loss > prev_val_loss:
        break  # Early stop

# ❌ BAD: Monitor test loss during training
for epoch in range(100):
    train_loss = train_step()
    test_loss = test_step()  # LEAKING TEST INFO!
```

### 3. **Report Both Validation and Test**
```python
# ✅ GOOD: Show both
print(f"Validation R²: {r2_val:.4f}")  # For development
print(f"Test R²: {r2_test:.4f}")       # Final performance

# This shows:
# - If val ≈ test: Good generalization
# - If val > test: Slight overfitting to val (expected)
# - If val << test: Lucky test set or data leakage
```

---

## Split Ratios

### Standard Splits

| Dataset Size | Train | Val | Test | Notes |
|--------------|-------|-----|------|-------|
| **Small (<1K)** | 60% | 20% | 20% | Standard |
| **Medium (1K-10K)** | 70% | 15% | 15% | More training data |
| **Large (>10K)** | 80% | 10% | 10% | Validation still sufficient |
| **Very Large (>100K)** | 90% | 5% | 5% | Small % still gives large val/test |

### Our Case (6629 samples)
```
Train:      3977 samples (60%)  ← Training
Validation: 1326 samples (20%)  ← Hyperparameter tuning
Test:       1326 samples (20%)  ← Final evaluation
```

This is a **medium dataset**, so 60/20/20 is perfect!

---

## K-Fold Cross-Validation Alternative

For even better estimates (but slower):

```python
from sklearn.model_selection import cross_val_score

# 5-fold CV on train+val, keep test separate
scores = cross_val_score(
    model, X_trainval, y_trainval,
    cv=5,
    scoring='r2'
)

print(f"CV R² (mean ± std): {scores.mean():.4f} ± {scores.std():.4f}")

# Then train on full train+val and evaluate on test
model.fit(X_trainval, y_trainval)
test_score = model.score(X_test, y_test)
print(f"Final Test R²: {test_score:.4f}")
```

**Use when:**
- ✅ Small dataset (< 1000 samples)
- ✅ Need robust performance estimates
- ✅ Have computation time
- ❌ Don't use if: Large dataset or time-constrained

---

## XGBoost Early Stopping Example

```python
# Create model with many trees
model = XGBRegressor(
    n_estimators=1000,  # Many trees (will stop early)
    learning_rate=0.05,
    random_state=42
)

# Train with early stopping on validation set
model.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_val, y_val)],
    eval_metric='rmse',
    early_stopping_rounds=50,  # Stop if no improvement for 50 rounds
    verbose=True
)

print(f"Best iteration: {model.best_iteration}")
print(f"Best validation score: {model.best_score}")

# Evaluate on test set (never seen during training!)
test_pred = model.predict(X_test)
test_rmse = mean_squared_error(y_test, test_pred, squared=False)
print(f"Test RMSE: {test_rmse:.4f}")
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Test for Hyperparameter Tuning
```python
# BAD: Tuning on test set
for lr in [0.01, 0.05, 0.1]:
    model.fit(X_train, y_train, learning_rate=lr)
    score = model.score(X_test, y_test)  # WRONG!
```

### ❌ Mistake 2: Not Using Validation Set
```python
# BAD: Direct train → test
model.fit(X_train, y_train)
test_score = model.score(X_test, y_test)
# No way to tune without touching test!
```

### ❌ Mistake 3: Data Leakage
```python
# BAD: Scaling before split
X_scaled = scaler.fit_transform(X)  # Used test data!
X_train, X_test = train_test_split(X_scaled)

# GOOD: Scale after split
X_train, X_test = train_test_split(X)
scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)
```

---

## Benefits Summary

### Immediate Benefits
- ✅ **Honest Performance**: Test scores reflect true generalization
- ✅ **Better Models**: Tune hyperparameters properly
- ✅ **Early Stopping**: Prevent overfitting automatically
- ✅ **Confidence**: Know your model will work on new data

### Long-term Benefits
- ✅ **Reproducibility**: Standard ML practice
- ✅ **Debugging**: Can identify overfitting issues
- ✅ **Comparison**: Fair comparison between models
- ✅ **Production**: Model performance matches expectations

---

## Your Updated Training

With the new split:

```python
================================================================================
📊 XGBoost Ranker Performance (VALIDATION SET)
================================================================================
RMSE:        0.0004
R² Score:    0.9998
================================================================================

================================================================================
📊 XGBoost Ranker Performance (TEST SET)
================================================================================
RMSE:        0.0004
R² Score:    0.9999
NDCG@20:     0.9999
Spearman ρ:  0.9795
================================================================================
✅ Test set remained unseen during training!
```

**Interpretation:**
- Val ≈ Test scores: **Excellent generalization!** ✅
- Both near 1.0: **Model learned the pattern very well**
- No overfitting: Val and Test perform similarly

---

## Conclusion

**Train/Val/Test split is the gold standard in ML:**
1. **Train** (60%): Learn patterns
2. **Validation** (20%): Tune and monitor
3. **Test** (20%): Final honest evaluation

This approach ensures your model performs well on **truly unseen data**, which is what matters in production! 🚀

