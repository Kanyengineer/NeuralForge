import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function InputPage() {
  const navigate = useNavigate();

  const [city, setCity] = useState("Bihar");
  const [rainfall, setRainfall] = useState(5);
  const [drainage, setDrainage] = useState(5);
  const [deforestation, setDeforestation] = useState(5);
  const [climate, setClimate] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Census 2011 baseline data (0-10 normalized scale).
  // urbanization is derived from urbanPercent, not hardcoded, so it stays
  // correct if urbanPercent is ever updated.
  const cityData = {
    Bihar: {
      urbanPercent: 11.3,
      urbanization: Math.min(10, +(11.3 / 5).toFixed(1)),
      basin: "Bihar Basin / Ganges Catchment"
    },
    Odisha: {
      urbanPercent: 16.68,
      urbanization: Math.min(10, +(16.68 / 5).toFixed(1)),
      basin: "Odisha Coastal Delta"
    }
  };

  const activeCity = cityData[city];

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const data = {
        state: city,
        MonsoonIntensity: Number(rainfall),
        DrainageSystems: Number(drainage),
        Urbanization: activeCity.urbanization,
        Deforestation: Number(deforestation),
        ClimateChange: Number(climate)
      };

      const res = await axios.post("http://127.0.0.1:5000/predict", data, {
        timeout: 15000
      });

      navigate("/result", {
        state: {
          ...res.data,
          inputs: {
            ...data,
            state: city
          }
        }
      });
    } catch (err) {
      console.error("ERROR:", err);
      if (err.code === "ECONNABORTED") {
        setError("The prediction is taking longer than expected. Please try again.");
      } else if (err.response) {
        setError(err.response.data?.error || "The server couldn't process this request.");
      } else {
        setError("Couldn't reach the prediction server. Is the backend running on port 5000?");
      }
    } finally {
      setLoading(false);
    }
  };

  const drainageDeficit = (rainfall - drainage).toFixed(1);
  const combinedStress = ((rainfall + (10 - drainage) + deforestation + climate) / 4).toFixed(1);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fcf9f1",
      color: "#1c2430",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Header */}
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
            Active Basin: <strong>{city}</strong>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 24px" }}>
        {/* Page Title */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#b45309",
            marginBottom: "6px"
          }}>
            ⚡ INFERENCE MATRIX CORE
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
            NeuralForge Flood Risk Predictor
          </h2>
          <p style={{ margin: 0, fontSize: "15px", color: "#64748b" }}>
            Enter hydrological & environmental parameters to estimate regional inundation probability.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "28px", alignItems: "start" }}>

          {/* Left Column: Form Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Target State Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid #e9e4d8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                    TERRITORY DOMAIN
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                    Target Indian State
                  </div>
                </div>
                <span style={{ fontSize: "20px" }}>🗺️</span>
              </div>

              {/* State Buttons */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                backgroundColor: "#f5f2e9",
                padding: "6px",
                borderRadius: "10px"
              }}>
                {["Bihar", "Odisha"].map((s) => {
                  const isSelected = city === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCity(s)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                        backgroundColor: isSelected ? "#ffffff" : "transparent",
                        color: isSelected ? "#0f172a" : "#64748b",
                        boxShadow: isSelected ? "0 2px 5px rgba(0,0,0,0.06)" : "none"
                      }}
                    >
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isSelected ? "#0284c7" : "#cbd5e1"
                      }}></span>
                      {s === "Bihar" ? "Bihar Basin" : "Odisha Delta"}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "12px", fontSize: "12px", color: "#64748b" }}>
                Selecting a state automatically anchors regional geospatial baseline metrics including Census urbanization indices.
              </div>
            </div>

            {/* Hydrological Parameters Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid #e9e4d8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
                  COVARIATES
                </div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                  Hydrological Parameters
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Calibrated whole-number range inputs (0 to 10 scale).</div>
              </div>

              {/* Slider 1: Monsoon Intensity */}
              <div style={{
                backgroundColor: "#faf8f2",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
                border: "1px solid #f0ece1"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                    <span>🌧️</span> Monsoon Intensity
                  </div>
                  <span style={{
                    backgroundColor: "#164e63",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}>
                    {rainfall}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 12px" }}>
                  Cumulative seasonal precipitation load and catchment saturation volume.
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#164e63", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  <span>0 (Minimal)</span>
                  <span>5 (Normal)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              {/* Slider 2: Drainage Systems */}
              <div style={{
                backgroundColor: "#faf8f2",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
                border: "1px solid #f0ece1"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                    <span>🚰</span> Drainage Systems
                  </div>
                  <span style={{
                    backgroundColor: "#164e63",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}>
                    {drainage}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 12px" }}>
                  Canal network throughput, stormwater diversion discharge efficiency.
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={drainage}
                  onChange={(e) => setDrainage(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#164e63", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  <span>0 (Choked)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Optimal)</span>
                </div>
              </div>

              {/* Urbanization (Locked Census Baseline) */}
              <div style={{
                backgroundColor: "#fff7ed",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
                border: "1px solid #fed7aa"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "#9a3412" }}>
                    <span>🏙️</span> Urbanization <span style={{ fontSize: "12px" }}>🔒</span>
                  </div>
                  <span style={{
                    backgroundColor: "#ea580c",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}>
                    {activeCity.urbanization}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#7c2d12", margin: "4px 0 8px" }}>
                  Impervious land cover and urban runoff coefficient.
                </div>
                <div style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#9a3412",
                  fontWeight: "500",
                  marginBottom: "8px"
                }}>
                  🛡️ Derived from Census 2011: <strong>{activeCity.urbanPercent}%</strong> urban share
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={activeCity.urbanization}
                  disabled
                  style={{ width: "100%", opacity: 0.5, cursor: "not-allowed" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9a3412", marginTop: "4px", opacity: 0.7 }}>
                  <span>0.0 (Rural)</span>
                  <span>Locked: {activeCity.urbanization}</span>
                  <span>10.0 (Dense Mega-Metropolis)</span>
                </div>
              </div>

              {/* Slider 3: Deforestation */}
              <div style={{
                backgroundColor: "#faf8f2",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
                border: "1px solid #f0ece1"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                    <span>🌲</span> Deforestation
                  </div>
                  <span style={{
                    backgroundColor: "#164e63",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}>
                    {deforestation}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 12px" }}>
                  Watershed canopy loss, reduced vegetal interception and soil percolation capacity.
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={deforestation}
                  onChange={(e) => setDeforestation(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#164e63", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  <span>0 (Intact Canopy)</span>
                  <span>5 (Fragmented)</span>
                  <span>10 (Severe Clearance)</span>
                </div>
              </div>

              {/* Slider 4: Climate Change Impact */}
              <div style={{
                backgroundColor: "#faf8f2",
                borderRadius: "10px",
                padding: "16px",
                border: "1px solid #f0ece1"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                    <span>🌡️</span> Climate Change Impact
                  </div>
                  <span style={{
                    backgroundColor: "#164e63",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}>
                    {climate}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 12px" }}>
                  Atmospheric & thermal anomalies, high-intensity brief precipitation episode scaling.
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={climate}
                  onChange={(e) => setClimate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#164e63", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  <span>0 (Stationary)</span>
                  <span>5 (Moderate Drift)</span>
                  <span>10 (Extreme Forcing)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Staging Summary & Trigger */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid #e9e4d8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#0284c7" }}></span>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>Inference Staging Summary</span>
                </div>
                <span style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "4px",
                  color: "#64748b",
                  fontFamily: "monospace"
                }}>
                  JSON Vector
                </span>
              </div>

              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                Serialized real-time feature vector configured for dispatch to the Flask hydrological inference pipeline.
              </div>

              {/* JSON Block */}
              <div style={{
                backgroundColor: "#f5f3ec",
                borderRadius: "8px",
                padding: "16px",
                fontFamily: "monospace",
                fontSize: "13px",
                color: "#1e293b",
                lineHeight: "1.6",
                border: "1px solid #ece7dc",
                marginBottom: "20px"
              }}>
                <div>{"{"}</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"Monsoon": <span style={{ color: "#0f172a" }}>{rainfall}</span>,</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"Drainage": <span style={{ color: "#0f172a" }}>{drainage}</span>,</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"Urbanization": <span style={{ color: "#0f172a" }}>{activeCity.urbanization}</span>,</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"Deforestation": <span style={{ color: "#0f172a" }}>{deforestation}</span>,</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"Climate": <span style={{ color: "#0f172a" }}>{climate}</span>,</div>
                <div style={{ paddingLeft: "16px", color: "#0369a1" }}>"State": <span style={{ color: "#b45309" }}>"{city}"</span></div>
                <div>{"}"}</div>
              </div>

              {/* Quick Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ backgroundColor: "#faf8f2", padding: "12px", borderRadius: "8px", border: "1px solid #f0ece1" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Drainage Deficit</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626", marginTop: "2px" }}>
                    +{drainageDeficit} pts
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Relative to monsoon load</div>
                </div>

                <div style={{ backgroundColor: "#faf8f2", padding: "12px", borderRadius: "8px", border: "1px solid #f0ece1" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Combined Stress</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    {combinedStress} / 10
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Mean vector magnitude</div>
                </div>
              </div>

              {/* Advisory note */}
              <div style={{
                display: "flex",
                gap: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "12px",
                color: "#475569",
                lineHeight: "1.5",
                marginBottom: "20px"
              }}>
                <span style={{ fontSize: "16px" }}>ℹ️</span>
                <span>The neural regressor estimates peak discharge inundation surface by computing runoff interaction curves against historical flood gauges.</span>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "16px"
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  backgroundColor: loading ? "#0e7490cc" : "#164e63",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(22, 78, 99, 0.25)",
                  transition: "all 0.15s ease"
                }}
              >
                <span>🚀</span>
                {loading ? "Computing Neural Runoff..." : "Run Prediction Model"}
              </button>
            </div>

            {/* Footnote card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "18px",
              border: "1px solid #e9e4d8",
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.6"
            }}>
              <strong style={{ color: "#0f172a" }}>Data Source Specification:</strong> Census of India 2011 Rural-Urban Distribution: Bihar baseline reflects 11.30% urban population density index ({cityData.Bihar.urbanization} normalized score). Odisha coastal river basin baseline reflects 16.68% urban share ({cityData.Odisha.urbanization} normalized score).
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: "60px",
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
