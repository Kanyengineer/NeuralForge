import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import pickle
import os

# ---------------- LOAD DATA ----------------
df = pd.read_csv("datasets/flood.csv")
df = df.drop("id", axis=1)

print("Dataset shape:", df.shape)

# ---------------- SPLIT ----------------
X = df.drop("FloodProbability", axis=1)
y = df["FloodProbability"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ---------------- MODEL ----------------
model = LinearRegression()

model.fit(X_train, y_train)

# ---------------- EVALUATION ----------------
y_pred = model.predict(X_test)

print("R2 Score:", r2_score(y_test, y_pred))
print("MAE:", mean_absolute_error(y_test, y_pred))

# ---------------- SAVE MODEL ----------------
pickle.dump(model, open("models/model.pkl", "wb"))
pickle.dump(list(X.columns), open("models/features.pkl", "wb"))

print("Model trained and saved successfully!")

# ---------------- FEATURE IMPORTANCE ----------------
# LinearRegression has no .feature_importances_ -> use coefficients instead.
# Coefficients can be negative, so we show signed values (color-coded)
# rather than taking abs(), since direction of effect is meaningful here.
importances = model.coef_
features = X.columns

if os.path.exists("feature_importance.png"):
    os.remove("feature_importance.png")

colors = ["#d62728" if c < 0 else "#1f77b4" for c in importances]

plt.clf()
plt.figure(figsize=(10, 6))
plt.barh(features, importances, color=colors)
plt.axvline(x=0, color="black", linewidth=0.8)
plt.title("Feature Coefficients (Linear Regression)")
plt.xlabel("Coefficient (effect on FloodProbability)")
plt.ylabel("Features")
plt.tight_layout()
plt.savefig("feature_importance.png")

# ---------------- RESIDUAL PLOT ----------------
residuals = y_test - y_pred

if os.path.exists("residual_plot.png"):
    os.remove("residual_plot.png")

plt.clf()
plt.figure(figsize=(8, 6))
plt.scatter(y_pred, residuals, alpha=0.5)
plt.axhline(y=0, color='red', linestyle='--')

plt.xlabel("Predicted Values")
plt.ylabel("Residuals")
plt.title("Residual Plot")

plt.tight_layout()
plt.savefig("residual_plot.png")

# ---------------- CORRELATION HEATMAP ----------------
corr = df.corr()

plt.clf()
plt.figure(figsize=(10, 8))
sns.heatmap(corr, annot=False, cmap="coolwarm")

plt.title("Feature Correlation Heatmap")
plt.tight_layout()
plt.savefig("correlation_heatmap.png")
