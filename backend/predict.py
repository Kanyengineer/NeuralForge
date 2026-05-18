import sys
import pickle

model = pickle.load(open("models/model.pkl", "rb"))
features_list = pickle.load(open("models/features.pkl", "rb"))

# base defaults
input_dict = {feature: 5 for feature in features_list}

# user inputs
MonsoonIntensity = float(sys.argv[1])
Deforestation = float(sys.argv[2])
Urbanization = float(sys.argv[3])
ClimateChange = float(sys.argv[4])
DrainageSystems = float(sys.argv[5])

input_dict["MonsoonIntensity"] = MonsoonIntensity
input_dict["Deforestation"] = Deforestation
input_dict["Urbanization"] = Urbanization
input_dict["ClimateChange"] = ClimateChange
input_dict["DrainageSystems"] = DrainageSystems

# SMART FEATURE INFERENCE

# rainfall effects
if MonsoonIntensity > 7:
    input_dict["Siltation"] = 9
    input_dict["Landslides"] = 9
    input_dict["RiverManagement"] = 3

# drainage effects
if DrainageSystems < 4:
    input_dict["Encroachments"] = 9
    input_dict["DeterioratingInfrastructure"] = 9

# deforestation effects
if Deforestation > 6:
    input_dict["WetlandLoss"] = 9
    input_dict["Watersheds"] = 8

# climate effects
if ClimateChange > 6:
    input_dict["CoastalVulnerability"] = 9
    input_dict["IneffectiveDisasterPreparedness"] = 8

# urbanization effects
if Urbanization > 7:
    input_dict["PopulationScore"] = 9
    input_dict["InadequatePlanning"] = 9

# correct order
final_input = [input_dict[f] for f in features_list]

prediction = model.predict([final_input])[0]

print(prediction)