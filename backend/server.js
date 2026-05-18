const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVE STATIC FILES (GRAPHS)
app.use(express.static(__dirname));

// test route
app.get("/", (req, res) =>
{
    res.send("NeuralForge API running");
});

// prediction route
app.post("/predict", (req, res) =>
{
    try
    {
        console.log("BODY RECEIVED:", req.body);

        const MonsoonIntensity = req.body.MonsoonIntensity;
        const DrainageSystems = req.body.DrainageSystems;
        const Urbanization = req.body.Urbanization;
        const Deforestation = req.body.Deforestation;
        const ClimateChange = req.body.ClimateChange;

        // validation
        if (
            MonsoonIntensity === undefined ||
            DrainageSystems === undefined ||
            Urbanization === undefined ||
            Deforestation === undefined ||
            ClimateChange === undefined
        )
        {
            return res.status(400).json({ error: "Missing main inputs" });
        }

        const values = [
            MonsoonIntensity,
            Deforestation,
            Urbanization,
            ClimateChange,
            DrainageSystems
        ];

        console.log("VALUES SENT:", values);

        const python = spawn("python", ["predict.py", ...values]);

        let result = "";
        let errorOutput = "";

        python.stdout.on("data", (data) =>
        {
            result += data.toString();
        });

        python.stderr.on("data", (data) =>
        {
            errorOutput += data.toString();
        });

        python.on("close", (code) =>
        {
            if (code !== 0)
            {
                console.error("PYTHON ERROR:", errorOutput);
                return res.status(500).json({ error: "Python execution failed" });
            }

            let raw = parseFloat(result.trim());

            // scaling
            let scaled = (raw - 0.52) * 6 + 0.5;
            scaled = Math.max(0, Math.min(1, scaled));

            let risk = "LOW";
            if (scaled > 0.65) risk = "HIGH";
            else if (scaled > 0.5) risk = "MEDIUM";

            // RESOURCE LOGIC
            let resources = {};

            const intensity = Math.ceil(scaled * 10);

            resources = {
                shelters: Math.max(1, Math.round(intensity + (10 - DrainageSystems))),
                medicalUnits: Math.max(1, Math.round(intensity * 0.8 + ClimateChange)),
                foodSupplies: Math.round(intensity * 120 + Urbanization * 20),
                personnel: Math.round(intensity * 15 + Deforestation * 5)
            };

            // dynamic message
            if (scaled > 0.7)
            {
                resources.message = "High risk detected. Immediate large-scale deployment recommended.";
            }
            else if (scaled > 0.4)
            {
                resources.message = "Moderate risk. Prepare resources and monitor closely.";
            }
            else
            {
                resources.message = "Low risk. Maintain basic preparedness.";
            }

            res.json({
                rawPrediction: raw,
                prediction: scaled,
                risk: risk,
                resources: resources
            });
        });
    }
    catch (err)
    {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// start server
app.listen(5000, () =>
{
    console.log("Server running on port 5000");
});