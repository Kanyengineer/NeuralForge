import pickle
import matplotlib.pyplot as plt
import pandas as pd

# load model + features
model = pickle.load(open("models/model.pkl", "rb"))
features_list = pickle.load(open("models/features.pkl", "rb"))
medians = pickle.load(open("models/feature_medians.pkl", "rb"))

# base input = real dataset medians (same source predict.py uses, so this
# graph stays consistent with actual prediction behavior instead of drifting)
input_dict = {f: medians[f] for f in features_list}

values = []

# vary rainfall from 0 to 10
# Note: real MonsoonIntensity values in the dataset range up to ~16-19, but
# 0-10 covers the bulk of the distribution and matches the UI slider range.
for r in range(0, 11):
    input_dict["MonsoonIntensity"] = r

    #  use DataFrame (fix warning + correct format)
    df = pd.DataFrame([input_dict])

    pred = model.predict(df)[0]
    values.append(pred)

#  plot graph
plt.figure(figsize=(8, 5))
plt.plot(range(0, 11), values, marker='o')

plt.xlabel("Monsoon Intensity")
plt.ylabel("Flood Probability")
plt.title("Rainfall vs Flood Risk")

plt.grid(True)

#  save image
plt.savefig("rainfall_graph.png")

print("Graph generated: rainfall_graph.png")