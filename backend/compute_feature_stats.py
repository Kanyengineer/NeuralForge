"""
Run this once (alongside model.py, using the same dataset) to generate
models/feature_medians.pkl — per-feature median values used as statistically
grounded placeholders in predict.py for features the user doesn't provide.

Medians (not means) are used because they're robust to outliers, and several
columns in flood.csv have out-of-range values (see item 6 on the backlog).
"""
import pandas as pd
import pickle

df = pd.read_csv("datasets/flood.csv")
df = df.drop("id", axis=1)

X = df.drop("FloodProbability", axis=1)
medians = X.median().to_dict()

pickle.dump(medians, open("models/feature_medians.pkl", "wb"))

print("Feature medians saved:")
for k, v in medians.items():
    print(f"  {k}: {v}")
