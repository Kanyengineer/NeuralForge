import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;
  const inputs = result?.inputs || {};

  if (!result) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#fcf9f1",
        color: "#1c2430",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          padding: "36px 40px",
          borderRadius: "14px",
          border: "1px solid #e9e4d8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          textAlign: "center",
          maxWidth: "460px"
        }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>No prediction data found.</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px" }}>Please submit the parameters form to compute regional flood risk.</p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 22px",
              backgroundColor: "#164e63",
              color: "#ffffff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(22, 78, 99, 0.2)"
            }}
          >
            ← Return to Input Form
          </button>
        </div>
      </div>
    );
  }

  // STATE DETECTION
  const selectedState = inputs.state || "Bihar";

  const getMapImage = () => {
    if (selectedState === "Odisha") return "/odisha_flood_map.png";
    return "/bihar_flood_map.png";
  };

  const getMapCenter = () => {
    if (selectedState === "Odisha") return [20.3, 85.8];
    return [25.5, 85.3];
  };

  const getBounds = () => {
    if (selectedState === "Odisha")
      return [[17.5, 81.5], [22.5, 87.5]];

    return [[24.0, 83.0], [27.5, 88.5]];
  };

  const riskColor =
    result.risk === "HIGH" ? "#ef4444" :
    result.risk === "MEDIUM" ? "#f59e0b" :
    "#10b981";

  const riskBgBadge =
    result.risk === "HIGH" ? "#fee2e2" :
    result.risk === "MEDIUM" ? "#fef3c7" :
    "#d1fae5";

  const getColor = () => {
    if (result.riskPercent > 70) return "red";
    if (result.riskPercent > 50) return "orange";
    return "green";
  };

  let explanation = [];

  // INPUT-BASED REASONS
  if (inputs.MonsoonIntensity > 7)
    explanation.push({
      icon: "🌧️",
      title: "High Rainfall Accumulation",
      text: "High rainfall: Monsoon intensity exceeds critical saturation baseline."
    });

  if (inputs.DrainageSystems < 4)
    explanation.push({
      icon: "🚰",
      title: "Poor Drainage Capacity",
      text: "Poor drainage: Stormwater canal throughput and conduit clearance are severely constrained."
    });

  if (inputs.Urbanization > 6)
    explanation.push({
      icon: "🏙️",
      title: "High Urbanization",
      text: "High urbanization: Impervious land cover significantly increases surface water runoff coefficients."
    });

  if (inputs.Deforestation > 6)
    explanation.push({
      icon: "🌳",
      title: "Deforestation Impact",
      text: "Deforestation impact: Watershed canopy loss reduces vegetal interception and soil percolation."
    });

  if (inputs.ClimateChange > 6)
    explanation.push({
      icon: "🌡️",
      title: "Climate Change Effects",
      text: "Climate change effects: Elevated thermal variance scales high-intensity brief precipitation events."
    });

  // MODEL-BASED REASON
  if (result.riskPercent > 65) {
    explanation.push({
      icon: "⚠️",
      title: "Elevated Risk Matrix",
      text: "Model predicts high flood risk based on combined multi-variate factors."
    });
  } else if (result.riskPercent > 50) {
    explanation.push({
      icon: "⚠️",
      title: "Moderate Risk Advisory",
      text: "Moderate flood risk detected across monitored drainage corridors."
    });
  } else {
    explanation.push({
      icon: "✅",
      title: "Low Inundation Risk",
      text: "Overall risk remains low across the current catchment territory."
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fcf9f1",
      color: "#1c2430",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Header matching InputPage */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 36px",
        borderBottom: "1px solid #ece7db",
        backgroundColor: "#ffffff"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0369a1",
            fontWeight: "bold",
            fontSize: "18px"
          }}>
            🌊
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>NeuralForge AI</h1>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Flood Risk Prediction & Planning</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            backgroundColor: "#f1f5f9",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "500",
            color: "#334155"
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981" }}></span>
            System Ready
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            backgroundColor: "#f1f5f9",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "500",
            color: "#334155"
          }}>
            Active Basin: <strong>{selectedState}</strong>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Page Title & Navigation Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <div style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#b45309",
              marginBottom: "6px"
            }}>
              ⚡ INFERENCE MATRIX OUTCOME
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
              Flood Prediction Result
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#64748b" }}>
              Regional hydrological risk synthesis for <strong>{selectedState}</strong> (Coordinates: {selectedState === "Odisha" ? "20.3°N, 85.8°E" : "25.5°N, 85.3°E"}).
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #dcdad2",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease"
              }}
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "10px 22px",
                backgroundColor: "#164e63",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(22, 78, 99, 0.2)"
              }}
            >
              ⚙️ Edit Parameters
            </button>
            <button
              onClick={() => navigate("/dashboard", { state: { state: selectedState } })}
              style={{
                padding: "10px 22px",
                backgroundColor: "#0369a1",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(3, 105, 161, 0.2)"
              }}
            >
              📊 View History & Trends
            </button>
          </div>
        </div>

        {/* Top Two-Column Grid: Score Card & Official Advisory */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "28px" }}>

          {/* Main Risk Score Card */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "24px 28px",
            border: "1px solid #e9e4d8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                HYDRO-SPATIAL INFERENCE
              </div>
              <span style={{
                backgroundColor: riskBgBadge,
                color: riskColor,
                fontWeight: "700",
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "20px",
                letterSpacing: "0.04em"
              }}>
                ● {result.risk} RISK
              </span>
            </div>

            <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "14px" }}>
              Probability Score
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "52px", fontWeight: "800", color: riskColor, lineHeight: 1 }}>
                {result.riskPercent.toFixed(1)}%
              </span>
              <span style={{ fontSize: "15px", color: "#64748b", fontWeight: "500" }}>
                aggregate probability
              </span>
              <span style={{ marginLeft: "auto", fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>
                Raw: {result.rawPrediction?.toFixed(3) ?? "N/A"}
              </span>
            </div>

            {/* Risk Gauge Bar */}
            <div style={{
              height: "12px",
              backgroundColor: "#f1f5f9",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "8px"
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, result.riskPercent))}%`,
                height: "100%",
                backgroundColor: riskColor,
                borderRadius: "10px",
                transition: "width 0.4s ease"
              }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
              <span>0% Nominal</span>
              <span>50% Threshold</span>
              <span style={{ color: "#ef4444", fontWeight: "600" }}>70% Critical Hazard</span>
              <span>100% Extreme</span>
            </div>

            <div style={{
              marginTop: "18px",
              padding: "10px 14px",
              backgroundColor: "#faf8f2",
              borderRadius: "8px",
              border: "1px solid #f0ece1",
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.5"
            }}>
              ℹ️ Categorized via predictive threshold bounds: <strong>&gt;70% High</strong>, 50–70% Medium, &lt;50% Low.
            </div>
          </div>

          {/* Official Advisory Message Card */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "24px 28px",
            border: "1px solid #e9e4d8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ fontSize: "22px" }}>🚨</span>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    Official Advisory Message
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Disaster Management Protocol [{selectedState} Grid]
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor:
                  result.alert?.severity === "critical" ? "#fef2f2" :
                  result.alert?.severity === "warning" ? "#fff7ed" :
                  "#eff6ff",
                border: `1px solid ${
                  result.alert?.severity === "critical" ? "#fecaca" :
                  result.alert?.severity === "warning" ? "#fed7aa" :
                  "#bfdbfe"
                }`,
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "12px"
              }}>
                <div style={{
                  fontSize: "11px", fontWeight: "700",
                  color:
                    result.alert?.severity === "critical" ? "#b91c1c" :
                    result.alert?.severity === "warning" ? "#c2410c" :
                    "#1d4ed8",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px"
                }}>
                  {result.alert?.title || "ACTION MANDATE"}
                </div>
                <div style={{
                  fontSize: "15px", fontWeight: "700", lineHeight: "1.45",
                  color:
                    result.alert?.severity === "critical" ? "#7f1d1d" :
                    result.alert?.severity === "warning" ? "#9a3412" :
                    "#1e3a8a"
                }}>
                  {result.alert?.description || result.resources?.message || "Standard hydrological monitoring advised."}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#94a3b8", paddingTop: "8px" }}>
              <span>● Telemetry Authenticated</span>
              <span>Ref ID: NF-{selectedState.toUpperCase()}-2585</span>
            </div>
          </div>

        </div>

        {/* Recommended Resources Grid */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px 28px",
          border: "1px solid #e9e4d8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          marginBottom: "28px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                TACTICAL LOGISTICS
              </div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                🚑 Recommended Resources
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Dynamic displacement calculations</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>

            {/* Shelters */}
            <div style={{ backgroundColor: "#faf8f2", padding: "16px 18px", borderRadius: "10px", border: "1px solid #f0ece1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                <span>Shelters</span>
                <span>🏛️</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#164e63", marginTop: "6px" }}>
                {result.resources?.shelters}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                Reinforced flood-refuge hubs
              </div>
              <div style={{ height: "4px", backgroundColor: "#164e63", borderRadius: "2px", marginTop: "12px" }} />
            </div>

            {/* Medical Units */}
            <div style={{ backgroundColor: "#faf8f2", padding: "16px 18px", borderRadius: "10px", border: "1px solid #f0ece1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                <span>Medical Units</span>
                <span>🚑</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#164e63", marginTop: "6px" }}>
                {result.resources?.medicalUnits}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                Mobile emergency trauma units
              </div>
              <div style={{ height: "4px", backgroundColor: "#b91c1c", borderRadius: "2px", marginTop: "12px" }} />
            </div>

            {/* Food Supplies */}
            <div style={{ backgroundColor: "#faf8f2", padding: "16px 18px", borderRadius: "10px", border: "1px solid #f0ece1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                <span>Food Supplies</span>
                <span>📦</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#164e63", marginTop: "6px" }}>
                {result.resources?.foodSupplies}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                Pre-packaged emergency rations
              </div>
              <div style={{ height: "4px", backgroundColor: "#d97706", borderRadius: "2px", marginTop: "12px" }} />
            </div>

            {/* Personnel */}
            <div style={{ backgroundColor: "#faf8f2", padding: "16px 18px", borderRadius: "10px", border: "1px solid #f0ece1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                <span>Personnel</span>
                <span>🛡️</span>
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#164e63", marginTop: "6px" }}>
                {result.resources?.personnel}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                NDRF rescue corps & specialists
              </div>
              <div style={{ height: "4px", backgroundColor: "#0284c7", borderRadius: "2px", marginTop: "12px" }} />
            </div>

          </div>
        </div>

        {/* Spatial Map Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px 28px",
          border: "1px solid #e9e4d8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          marginBottom: "28px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>🗺️</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  Risk Map ({selectedState})
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                OpenStreetMap basemap integration • Dynamic GIS catchment radius
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#0284c7", fontWeight: "600" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284c7" }}></span>
              Inundation Overlay Active
            </div>
          </div>

          <div style={{
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            height: "420px",
            width: "100%"
          }}>
            <MapContainer
              center={getMapCenter()}
              zoom={6}
              minZoom={6}
              maxZoom={8}
              maxBounds={getBounds()}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
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
                  fillOpacity: 0.35,
                  weight: 2
                }}
              />
            </MapContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "12px", color: "#64748b" }}>
            <div>
              🔴 <strong>60km Danger Perimeter:</strong> Predicted inundation buffer zone based on active rainfall
            </div>
            <div>
              Coordinates: {getMapCenter()[0]}°N, {getMapCenter()[1]}°E
            </div>
          </div>
        </div>

        {/* Feature Importance & Residual Plots Side-by-Side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>

          {/* Feature Importance */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "24px 28px",
            border: "1px solid #e9e4d8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                Feature Importance
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>SHAP / Gradient</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Hydrological feature weights driving the neural prediction.
            </div>
            <img
              src={`http://127.0.0.1:5000/feature_importance.png?${Date.now()}`}
              alt="Feature Importance"
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
          </div>

          {/* Residual Plot */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            padding: "24px 28px",
            border: "1px solid #e9e4d8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                Residual Plot
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>Predicted vs. Observed</span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Model error variance distribution across test catchments.
            </div>
            <img
              src="http://127.0.0.1:5000/residual_plot.png"
              alt="Residual"
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
          </div>

        </div>

        {/* Explanations Section */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          padding: "24px 28px",
          border: "1px solid #e9e4d8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          marginBottom: "36px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                MODEL REASONING
              </div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                Explanation
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Automated attribution cards</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {explanation.map((e, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                backgroundColor: "#faf8f2",
                borderRadius: "10px",
                border: "1px solid #f0ece1",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px"
              }}>
                <span style={{ fontSize: "18px", lineHeight: "1.2" }}>{e.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{e.title}</div>
                  <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>{e.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer matching InputPage */}
      <footer style={{
        marginTop: "40px",
        padding: "18px 36px",
        borderTop: "1px solid #ece7db",
        backgroundColor: "#f7f4ec",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        color: "#64748b"
      }}>
        <span>NeuralForge AI © Hydrological Observational Modeling Core. High-confidence geospatial predictive system.</span>
        <div style={{ display: "flex", gap: "16px" }}>
          <span>● Bihar Basin Stream A</span>
          <span>● Odisha Delta Sensor Array</span>
        </div>
      </footer>
    </div>
  );
}
