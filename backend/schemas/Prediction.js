const mongoose = require("mongoose");

// One document per prediction made through the app. This is what powers
// the trend/history view and lets alerts reference "risk over time"
// rather than just a single snapshot.
const predictionSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
    },
    inputs: {
        MonsoonIntensity: Number,
        DrainageSystems: Number,
        Urbanization: Number,
        Deforestation: Number,
        ClimateChange: Number,
    },
    rawPrediction: {
        type: Number,
        required: true,
    },
    riskPercent: {
        type: Number,
        required: true,
    },
    risk: {
        type: String, // "LOW" | "MEDIUM" | "HIGH"
        required: true,
    },
    // Snapshot of the risk% from this state's last prediction at save time,
    // if one existed. Lets the dashboard show "risk rising/falling" without
    // needing to re-query and re-sort history on every read.
    previousRiskPercent: {
        type: Number,
        default: null,
    },
    resources: {
        shelters: Number,
        medicalUnits: Number,
        foodSupplies: Number,
        personnel: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index on state + createdAt speeds up the common query pattern:
// "give me this state's history, most recent first"
predictionSchema.index({ state: 1, createdAt: -1 });

module.exports = mongoose.model("Prediction", predictionSchema);
