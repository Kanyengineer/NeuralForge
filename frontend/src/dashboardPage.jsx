import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATES = ["Bihar", "Odisha"];

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

function riskColor(risk) {
  if (risk === "HIGH") return "#ef4444";
  if (risk === "MEDIUM") return "#f59e0b";
  return "#22c55e";
}

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialState = location.state?.state || STATES[0];
  const [selectedState, setSelectedState] = useState(initialState);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (state) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/history`, {
        params: { state, limit: 50 },
        timeout: 10000,
      });
      // API returns most-recent-first; reverse for a left-to-right timeline
      setRecords([...res.data.predictions].reverse());
    } catch (err) {
      console.error(err);
      setError("Couldn't load history. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(selectedState);
  }, [selectedState, fetchHistory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prediction record? This can't be undone.")) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/history/${id}`);
      // Refresh the list rather than manually splicing state, so the
      // trend/chart/latest-risk cards all stay in sync with the real data.
      fetchHistory(selectedState);
    } catch (err) {
      console.error("Failed to delete record:", err);
      setError("Couldn't delete that record. Try again.");
    }
  };

  const latest = records[records.length - 1];
  const previous = records.length > 1 ? records[records.length - 2] : null;

  const trend = previous
    ? latest.riskPercent - previous.riskPercent
    : null;

  const chartData = records.map((r, i) => ({
    index: i + 1,
    risk: r.riskPercent,
    date: new Date(r.createdAt).toLocaleDateString(),
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #020617)",
      color: "white",
      padding: "24px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: 0 }}>📊 Risk Dashboard</h1>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#334155",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            New Prediction
          </button>
        </div>

        {/* STATE SELECTOR */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px", opacity: 0.8 }}>State:</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "none" }}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading && <p style={{ opacity: 0.7 }}>Loading history...</p>}

        {error && (
          <div style={{
            background: "#450a0a",
            border: "1px solid #ef4444",
            color: "#fecaca",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}>
            {error}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div style={{
            background: "#1e293b",
            padding: "30px",
            borderRadius: "15px",
            textAlign: "center",
          }}>
            <p style={{ opacity: 0.8, margin: 0 }}>
              No predictions saved yet for {selectedState}. Make a prediction first to start building history.
            </p>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <>
            {/* LATEST SNAPSHOT + TREND */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}>
              <div style={{ background: "#1e293b", borderRadius: "15px", padding: "20px" }}>
                <p style={{ opacity: 0.6, margin: "0 0 8px", fontSize: "13px" }}>LATEST RISK</p>
                <h2 style={{ margin: 0, color: riskColor(latest.risk) }}>
                  {latest.riskPercent.toFixed(1)}% — {latest.risk}
                </h2>
                <p style={{ opacity: 0.5, fontSize: "12px", marginTop: "8px" }}>
                  {new Date(latest.createdAt).toLocaleString()}
                </p>
              </div>

              <div style={{ background: "#1e293b", borderRadius: "15px", padding: "20px" }}>
                <p style={{ opacity: 0.6, margin: "0 0 8px", fontSize: "13px" }}>TREND vs. LAST CHECK</p>
                {trend === null ? (
                  <h2 style={{ margin: 0, opacity: 0.6, fontSize: "18px" }}>Not enough history yet</h2>
                ) : (
                  <h2 style={{
                    margin: 0,
                    color: trend > 0 ? "#ef4444" : trend < 0 ? "#22c55e" : "#94a3b8",
                  }}>
                    {trend > 0 ? "▲" : trend < 0 ? "▼" : "—"} {Math.abs(trend).toFixed(1)} pts
                  </h2>
                )}
                <p style={{ opacity: 0.5, fontSize: "12px", marginTop: "8px" }}>
                  {records.length} prediction{records.length !== 1 ? "s" : ""} recorded
                </p>
              </div>
            </div>

            {/* TREND CHART */}
            <div style={{ background: "#1e293b", borderRadius: "15px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ marginTop: 0 }}>Risk % Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" label={{ value: "Prediction #", position: "insideBottom", offset: -5, fill: "#94a3b8" }} />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                    labelFormatter={(i) => `Prediction #${i}`}
                  />
                  <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* RECENT RECORDS TABLE */}
            <div style={{ background: "#1e293b", borderRadius: "15px", padding: "20px" }}>
              <h3 style={{ marginTop: 0 }}>Recent Predictions</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ textAlign: "left", opacity: 0.6 }}>
                      <th style={{ padding: "8px" }}>Date</th>
                      <th style={{ padding: "8px" }}>Risk %</th>
                      <th style={{ padding: "8px" }}>Tier</th>
                      <th style={{ padding: "8px" }}>Shelters</th>
                      <th style={{ padding: "8px" }}>Personnel</th>
                      <th style={{ padding: "8px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...records].reverse().slice(0, 10).map((r) => (
                      <tr key={r._id} style={{ borderTop: "1px solid #334155" }}>
                        <td style={{ padding: "8px", opacity: 0.8 }}>
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: "8px" }}>{r.riskPercent.toFixed(1)}%</td>
                        <td style={{ padding: "8px", color: riskColor(r.risk), fontWeight: "600" }}>
                          {r.risk}
                        </td>
                        <td style={{ padding: "8px" }}>{r.resources?.shelters ?? "—"}</td>
                        <td style={{ padding: "8px" }}>{r.resources?.personnel ?? "—"}</td>
                        <td style={{ padding: "8px" }}>
                          <button
                            onClick={() => handleDelete(r._id)}
                            title="Delete this record"
                            style={{
                              background: "transparent",
                              border: "1px solid #ef4444",
                              color: "#ef4444",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
