require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { spawn } = require("child_process");
const Prediction = require("./schemas/Prediction");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

// ---------------------------------------------------------------------
// SWAGGER / API DOCS
// ---------------------------------------------------------------------
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "NeuralForge API",
            version: "1.0.0",
            description:
                "Flood risk prediction and proactive resource-planning API. " +
                "Wraps a Linear Regression model trained on environmental data.",
        },
        servers: [{ url: "http://localhost:5000" }],
    },
    apis: ["./server.js"], // reads the JSDoc/YAML comment blocks in this file
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------------------------------------------------------------------
// DATABASE CONNECTION
// ---------------------------------------------------------------------
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        console.error("Predictions will still work, but history won't be saved.");
    });

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check
 *     description: Confirms the API is running.
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/", (req, res) => {
    res.send("NeuralForge API running");
});

// ---------------------------------------------------------------------
// RISK TIERS
// ---------------------------------------------------------------------
// FloodProbability in the training dataset (flood.csv, n=1,117,957) runs
// from ~0.285 to ~0.725, clustered tightly around a mean of 0.505
// (std 0.051). These are the ACTUAL data percentiles, not invented cutoffs:
//   5th=0.42  25th=0.47  50th=0.505  75th=0.54  90th=0.57  95th=0.59
//
// Risk tiers below are set at the 25th and 75th percentiles of real
// FloodProbability values. This means "LOW" / "MEDIUM" / "HIGH" reflect
// where a prediction falls relative to the actual dataset, not an
// artificially rescaled or stretched number.
const RISK_THRESHOLDS = {
    low: 0.47,   // 25th percentile
    high: 0.54,  // 75th percentile
};

function getRiskTier(rawPrediction) {
    if (rawPrediction >= RISK_THRESHOLDS.high) return "HIGH";
    if (rawPrediction >= RISK_THRESHOLDS.low) return "MEDIUM";
    return "LOW";
}

// ---------------------------------------------------------------------
// RESOURCE PLANNING
// ---------------------------------------------------------------------
// We don't yet have real per-location population data (that's future-scope
// API work), so these formulas intentionally do NOT pretend to model an
// actual population. Instead, each formula is a plain, stated ratio
// relative to risk severity, so every number in the response is explainable
// in a demo or write-up — no hidden multipliers.
//
//   - riskPercent: raw model probability, shown as a 0-100% figure directly
//     (no rescaling — see risk tier note above)
//   - shelters: 1 baseline + 2 additional shelters per 10% of risk
//   - medicalUnits: 1 baseline + 1 additional unit per 10% of risk
//   - foodSupplies: 50 baseline + 100 additional units per 10% of risk
//   - personnel: 5 baseline + 10 additional personnel per 10% of risk
// These are placeholder planning ratios pending real demographic data
// (see Future Scope: real-time population / GIS integration).
function computeResources(riskPercent) {
    const riskUnits = riskPercent / 10; // number of "10% risk" increments

    const shelters = Math.round(1 + riskUnits * 2);
    const medicalUnits = Math.round(1 + riskUnits * 1);
    const foodSupplies = Math.round(50 + riskUnits * 100);
    const personnel = Math.round(5 + riskUnits * 10);

    let message;
    if (riskPercent >= RISK_THRESHOLDS.high * 100) {
        message = "High risk detected. Immediate large-scale deployment recommended.";
    } else if (riskPercent >= RISK_THRESHOLDS.low * 100) {
        message = "Moderate risk. Prepare resources and monitor closely.";
    } else {
        message = "Low risk. Maintain basic preparedness.";
    }

    return {
        shelters,
        medicalUnits,
        foodSupplies,
        personnel,
        message,
        formulaNote:
            "Placeholder planning ratios (baseline + per-10%-risk increment); " +
            "not yet based on real population data for the location.",
    };
}

// ---------------------------------------------------------------------
// ALERTS
// ---------------------------------------------------------------------
// A structured alert object, separate from the plain-language "message"
// above, so the frontend can render it distinctly (banner, color, icon)
// rather than parsing text. Severity maps directly to the same real
// percentile-based risk tiers used everywhere else in the app — no new
// thresholds invented here.
function buildAlert(risk, riskPercent) {
    if (risk === "HIGH") {
        return {
            severity: "critical",
            title: "High Flood Risk Detected",
            description:
                `Predicted flood probability (${riskPercent.toFixed(1)}%) is in the top ` +
                "quartile of historical outcomes for this dataset. Immediate resource " +
                "deployment and close monitoring are recommended.",
        };
    }
    if (risk === "MEDIUM") {
        return {
            severity: "warning",
            title: "Moderate Flood Risk",
            description:
                `Predicted flood probability (${riskPercent.toFixed(1)}%) is above typical ` +
                "baseline levels. Recommend preparing resources and monitoring conditions.",
        };
    }
    return {
        severity: "info",
        title: "Low Flood Risk",
        description:
            `Predicted flood probability (${riskPercent.toFixed(1)}%) is within the ` +
            "typical/expected range. Maintain standard preparedness.",
    };
}

/**
 * @openapi
 * /predict:
 *   post:
 *     summary: Predict flood risk and get resource-planning recommendations
 *     description: >
 *       Runs the trained Linear Regression model against 5 user-provided inputs
 *       (the remaining 15 model features default to real dataset medians).
 *       Also saves the prediction to history (if MongoDB is connected).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [MonsoonIntensity, DrainageSystems, Urbanization, Deforestation, ClimateChange]
 *             properties:
 *               state:
 *                 type: string
 *                 example: Bihar
 *               MonsoonIntensity:
 *                 type: number
 *                 example: 7
 *               DrainageSystems:
 *                 type: number
 *                 example: 3
 *               Urbanization:
 *                 type: number
 *                 example: 2.3
 *               Deforestation:
 *                 type: number
 *                 example: 6
 *               ClimateChange:
 *                 type: number
 *                 example: 6
 *     responses:
 *       200:
 *         description: Prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rawPrediction:
 *                   type: number
 *                   description: Raw model output (0-1 probability), unscaled
 *                 riskPercent:
 *                   type: number
 *                   description: rawPrediction as a percentage
 *                 risk:
 *                   type: string
 *                   enum: [LOW, MEDIUM, HIGH]
 *                 resources:
 *                   type: object
 *                   description: Placeholder resource-planning numbers (see formulaNote)
 *                 alert:
 *                   type: object
 *                   properties:
 *                     severity:
 *                       type: string
 *                       enum: [info, warning, critical]
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Server or model error
 */
app.post("/predict", (req, res) => {
    try {
        console.log("BODY RECEIVED:", req.body);

        const MonsoonIntensity = req.body.MonsoonIntensity;
        const DrainageSystems = req.body.DrainageSystems;
        const Urbanization = req.body.Urbanization;
        const Deforestation = req.body.Deforestation;
        const ClimateChange = req.body.ClimateChange;

        const inputs = {
            MonsoonIntensity,
            DrainageSystems,
            Urbanization,
            Deforestation,
            ClimateChange,
        };

        const missing = Object.entries(inputs)
            .filter(([, v]) => v === undefined || v === null || v === "")
            .map(([k]) => k);

        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing inputs: ${missing.join(", ")}` });
        }

        const numericInputs = {};
        for (const [key, val] of Object.entries(inputs)) {
            const num = Number(val);
            // Backend allows full real dataset range (0-19, confirmed via data
            // inspection) even though the UI may cap sliders at 0-10 for usability.
            if (Number.isNaN(num) || num < 0 || num > 19) {
                return res.status(400).json({
                    error: `Invalid value for ${key}: must be a number between 0 and 19, got '${val}'`,
                });
            }
            numericInputs[key] = num;
        }

        const values = [
            numericInputs.MonsoonIntensity,
            numericInputs.Deforestation,
            numericInputs.Urbanization,
            numericInputs.ClimateChange,
            numericInputs.DrainageSystems,
        ].map(String);

        console.log("VALUES SENT:", values);

        const python = spawn("python", ["predict.py", ...values]);

        let result = "";
        let errorOutput = "";

        python.stdout.on("data", (data) => {
            result += data.toString();
        });

        python.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        python.on("close", (code) => {
            if (code !== 0) {
                console.error("PYTHON ERROR:", errorOutput);
                return res.status(500).json({ error: "Python execution failed", details: errorOutput });
            }

            const raw = parseFloat(result.trim());
            if (Number.isNaN(raw)) {
                console.error("Could not parse model output:", result);
                return res.status(500).json({ error: "Invalid model output" });
            }

            // No rescaling — raw IS the model's real probability output.
            const riskPercent = raw * 100;
            const risk = getRiskTier(raw);
            const resources = computeResources(riskPercent);
            const alert = buildAlert(risk, riskPercent);

            const responseData = {
                rawPrediction: raw,
                riskPercent: Number(riskPercent.toFixed(1)),
                risk,
                resources,
                alert,
            };

            res.json(responseData);

            // Save to history AFTER responding — a slow or failed DB write
            // should never delay or break the user's prediction result.
            const state = req.body.state || "Unknown";

            // Trend comparison: look up this state's most recent prior
            // prediction (if any) so future dashboard views can show
            // "risk rising/falling since last check." Doesn't block the
            // response — this is purely for the saved record, and quietly
            // does nothing if there's no prior history yet.
            Prediction.findOne({ state }).sort({ createdAt: -1 }).then((previous) => {
                Prediction.create({
                    state,
                    inputs: numericInputs,
                    rawPrediction: raw,
                    riskPercent: responseData.riskPercent,
                    risk,
                    resources: {
                        shelters: resources.shelters,
                        medicalUnits: resources.medicalUnits,
                        foodSupplies: resources.foodSupplies,
                        personnel: resources.personnel,
                    },
                    previousRiskPercent: previous ? previous.riskPercent : null,
                }).catch((err) => {
                    console.error("Failed to save prediction history:", err.message);
                });
            }).catch((err) => {
                console.error("Failed to look up previous prediction:", err.message);
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------------------------------------------------------------
// HISTORY ROUTE
// ---------------------------------------------------------------------
// Supports optional query params:
//   ?state=Bihar   — filter to one state
//   ?limit=20      — cap number of records returned (default 50)
/**
 * @openapi
 * /history:
 *   get:
 *     summary: Get past predictions
 *     description: Returns saved prediction history, most recent first.
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter to a specific state (e.g. Bihar)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max records to return (default 50, max 500)
 *     responses:
 *       200:
 *         description: List of past predictions
 *       500:
 *         description: Could not retrieve history
 */
app.get("/history", async (req, res) => {
    try {
        const filter = {};
        if (req.query.state) {
            filter.state = req.query.state;
        }

        const limit = Math.min(Number(req.query.limit) || 50, 500);

        const records = await Prediction.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ count: records.length, predictions: records });
    } catch (err) {
        console.error("Failed to fetch history:", err.message);
        res.status(500).json({ error: "Could not retrieve prediction history" });
    }
});

/**
 * @openapi
 * /history/{id}:
 *   delete:
 *     summary: Delete a single prediction record
 *     description: Removes one saved prediction by its MongoDB _id. Used to clear test/debug entries from history.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The _id of the prediction record to delete
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Record not found
 *       500:
 *         description: Could not delete record
 */
app.delete("/history/:id", async (req, res) => {
    try {
        const deleted = await Prediction.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Prediction record not found" });
        }
        res.json({ success: true, deletedId: req.params.id });
    } catch (err) {
        console.error("Failed to delete prediction:", err.message);
        res.status(500).json({ error: "Could not delete prediction record" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
