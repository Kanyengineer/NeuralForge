import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function ResultPage()
{
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;
  const inputs = result?.inputs || {};

  if (!result)
  {
    return <h2 style={{ color: "white", textAlign: "center" }}>No data, go back</h2>;
  }

  // STATE DETECTION
  const selectedState = inputs.state || "Bihar";

  const getMapImage = () =>
  {
    if (selectedState === "Odisha") return "/odisha_flood_map.png";
    return "/bihar_flood_map.png";
  };

  const getMapCenter = () =>
  {
    if (selectedState === "Odisha") return [20.3, 85.8];
    return [25.5, 85.3];
  };

  const getBounds = () =>
  {
    if (selectedState === "Odisha")
      return [[17.5, 81.5], [22.5, 87.5]];

    return [[24.0, 83.0], [27.5, 88.5]];
  };

  const riskColor =
    result.risk === "HIGH" ? "#ef4444" :
    result.risk === "MEDIUM" ? "#f59e0b" :
    "#22c55e";

  const getColor = () =>
  {
    if (result.prediction > 0.7) return "red";
    if (result.prediction > 0.5) return "orange";
    return "green";
  };

  // let explanation = [];

  // if (inputs.MonsoonIntensity > 7) explanation.push("🌧️ High rainfall");
  // if (inputs.DrainageSystems < 4) explanation.push("🚰 Poor drainage");
  // if (inputs.Urbanization > 6) explanation.push("🏙️ High urbanization");
  // if (inputs.Deforestation > 6) explanation.push("🌳 Deforestation impact");
  // if (inputs.ClimateChange > 6) explanation.push("🌡️ Climate change effects");
  // if (explanation.length === 0) explanation.push("✅ Conditions are relatively stable");
  let explanation = [];

  // INPUT-BASED REASONS
  if (inputs.MonsoonIntensity > 7)
    explanation.push("🌧️ High rainfall");

  if (inputs.DrainageSystems < 4)
    explanation.push("🚰 Poor drainage");

  if (inputs.Urbanization > 6)
    explanation.push("🏙️ High urbanization");

  if (inputs.Deforestation > 6)
    explanation.push("🌳 Deforestation impact");

  if (inputs.ClimateChange > 6)
    explanation.push("🌡️ Climate change effects");

  // MODEL-BASED REASON
  if (result.prediction > 0.65)
  {
    explanation.push("⚠️ Model predicts high flood risk based on combined factors");
  }
  else if (result.prediction > 0.5)
  {
    explanation.push("⚠️ Moderate flood risk detected");
  }
  else
  {
    explanation.push("✅ Overall risk remains low");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #020617)",
      color: "white",
      padding: "20px",
      textAlign: "center"
    }}>

      <h1>🌊 Flood Prediction Result</h1>

      {/* MAIN CARD */}
      <div style={{
        maxWidth: "500px",
        margin: "auto",
        background: "#1e293b",
        padding: "25px",
        borderRadius: "15px"
      }}>
        <h2>Probability: {(result.prediction * 100).toFixed(1)}%</h2>
        <h1 style={{ color: riskColor }}>{result.risk}</h1>

        <div style={{
          height: "10px",
          background: "#334155",
          borderRadius: "10px"
        }}>
          <div style={{
            width: `${result.prediction * 100}%`,
            height: "100%",
            background: riskColor
          }} />
        </div>

        <p style={{ opacity: 0.6 }}>
          Raw: {result.rawPrediction.toFixed(3)}
        </p>
      </div>

      {/* RESOURCES */}
      <div style={{
        maxWidth: "500px",
        margin: "30px auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <h2>🚑 Recommended Resources</h2>

        <p>Shelters: {result.resources.shelters}</p>
        <p>Medical Units: {result.resources.medicalUnits}</p>
        <p>Food Supplies: {result.resources.foodSupplies}</p>
        <p>Personnel: {result.resources.personnel}</p>

        <p style={{ color: "#94a3b8" }}>
          {result.resources.message}
        </p>
      </div>

      {/* FEATURE IMPORTANCE */}
      <div style={{
        maxWidth: "600px",
        margin: "30px auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <h2>Feature Importance</h2>

        <img
          src={`http://127.0.0.1:5000/feature_importance.png?${Date.now()}`}
          alt="Feature Importance"
          style={{ width: "100%" }}
        />
      </div>

      {/* RESIDUAL */}
      <div style={{
        maxWidth: "600px",
        margin: "30px auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <h2>Residual Plot</h2>

        <img
          src="http://127.0.0.1:5000/residual_plot.png"
          alt="Residual"
          style={{ width: "100%" }}
        />
      </div>

      {/* MAP */}
      <div style={{
        maxWidth: "600px",
        margin: "30px auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <h2>Risk Map ({selectedState})</h2>

        <MapContainer
          center={getMapCenter()}
          zoom={6}
          minZoom={6}
          maxZoom={8}
          maxBounds={getBounds()}
          maxBoundsViscosity={1.0}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <ImageOverlay
            url={getMapImage()}
            bounds={getBounds()}
            opacity={0.45}
          />

          <Circle
            center={getMapCenter()}
            radius={60000}
            pathOptions={{
              color: getColor(),
              fillColor: getColor(),
              fillOpacity: 0.4
            }}
          />
        </MapContainer>
      </div>

      {/* EXPLANATION */}
      <div style={{
        maxWidth: "500px",
        margin: "auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <h2>Explanation</h2>
        {explanation.map((e, i) => <p key={i}>{e}</p>)}
      </div>

      <button onClick={() => navigate("/")}>
        Go Back
      </button>

    </div>
  );
}

export default ResultPage;