import sys
import pickle
import pandas as pd

MODEL_PATH = "models/model.pkl"
FEATURES_PATH = "models/features.pkl"
MEDIANS_PATH = "models/feature_medians.pkl"

# Features the user is expected to supply on the command line, in order.
# (See backlog item 3: ~6 of the remaining 15 are realistically fetchable
# from real APIs based on user location — that wiring isn't done yet, so
# every feature not in USER_INPUT_FEATURES falls back to its dataset median.)
USER_INPUT_FEATURES = [
    "MonsoonIntensity",
    "Deforestation",
    "Urbanization",
    "ClimateChange",
    "DrainageSystems",
]

VALID_RANGE = (0, 19)  # actual dataset range (confirmed via data inspection).
# Note: the frontend UI may still cap user-facing sliders at 0-10 for
# usability (matches the paper's UI design), but backend validation must
# allow the full real range so legitimate dataset rows aren't rejected.


def load_artifacts():
    model = pickle.load(open(MODEL_PATH, "rb"))
    features_list = pickle.load(open(FEATURES_PATH, "rb"))
    medians = pickle.load(open(MEDIANS_PATH, "rb"))
    return model, features_list, medians


def parse_and_validate_args(argv, expected_count):
    if len(argv) != expected_count + 1:  # +1 for script name
        sys.exit(
            f"Error: expected {expected_count} arguments "
            f"({', '.join(USER_INPUT_FEATURES)}), got {len(argv) - 1}."
        )

    values = []
    for name, raw in zip(USER_INPUT_FEATURES, argv[1:]):
        try:
            val = float(raw)
        except ValueError:
            sys.exit(f"Error: '{name}' must be a number, got '{raw}'.")

        if not (VALID_RANGE[0] <= val <= VALID_RANGE[1]):
            sys.exit(
                f"Error: '{name}' = {val} is out of the expected range "
                f"{VALID_RANGE[0]}-{VALID_RANGE[1]}."
            )
        values.append(val)
    return values


def build_input(features_list, medians, user_values):
    # start every feature at its dataset median (statistically grounded
    # placeholder — replaces the old flat default of 5 and the fabricated
    # if/else "smart inference" rules, which had no real basis)
    input_dict = {f: medians[f] for f in features_list}

    for name, val in zip(USER_INPUT_FEATURES, user_values):
        input_dict[name] = val

    # DataFrame (not a raw list) so column names match what the model was
    # trained on — avoids sklearn's "X does not have valid feature names" warning
    return pd.DataFrame([[input_dict[f] for f in features_list]], columns=features_list)


def main():
    model, features_list, medians = load_artifacts()

    missing = [f for f in USER_INPUT_FEATURES if f not in features_list]
    if missing:
        sys.exit(f"Error: model was not trained on expected features: {missing}")

    user_values = parse_and_validate_args(sys.argv, len(USER_INPUT_FEATURES))
    final_input = build_input(features_list, medians, user_values)

    prediction = model.predict(final_input)[0]
    print(prediction)


if __name__ == "__main__":
    main()
