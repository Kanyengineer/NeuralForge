import pickle
import matplotlib.pyplot as plt
import pandas as pd

# load model + features
model = pickle.load(open("models/model.pkl", "rb"))
features_list = pickle.load(open("models/features.pkl", "rb"))

# base input (all default = 5)
input_dict = {f: 5 for f in features_list}

values = []

# vary rainfall from 0 to 10
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

print(" Graph generated: rainfall_graph.png")