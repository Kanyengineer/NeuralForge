import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InputPage()
{
  const navigate = useNavigate();

  const [city, setCity] = useState("Bihar");

  const [rainfall, setRainfall] = useState(5);
  const [drainage, setDrainage] = useState(5);
  const [deforestation, setDeforestation] = useState(5);
  const [climate, setClimate] = useState(5);

  // city data
  const cityData = {
    Bihar: {
      urbanization: 5
    },
    Odisha: {
      urbanization: 6
    }
  };

  const handleSubmit = async () =>
  {
    try
    {
      const c = cityData[city];

      const data = {
        MonsoonIntensity: Number(rainfall),
        DrainageSystems: Number(drainage),
        Urbanization: c.urbanization,
        Deforestation: Number(deforestation),
        ClimateChange: Number(climate)
      };

      console.log("SENDING DATA:", data);

      const res = await axios.post("http://127.0.0.1:5000/predict", data);

      console.log("RESPONSE:", res.data);

      // FINAL FIX (STATE PASSING)
      navigate("/result", {
        state: {
          ...res.data,
          inputs: {
            ...data,
            state: city
          }
        }
      });
    }
    catch (err)
    {
      console.error("ERROR:", err);
      alert("Backend error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      padding: "20px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ textAlign: "center" }}>NeuralForge</h1>

      <div style={{
        maxWidth: "400px",
        margin: "auto",
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px"
      }}>

        {/* State */}
        <label>State</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: "100%", marginBottom: "15px", padding: "8px" }}
        >
          <option value="Bihar">Bihar</option>
          <option value="Odisha">Odisha</option>
        </select>

        {/* Rainfall */}
        <label>Monsoon Intensity</label>
        <input
          type="range"
          min="0"
          max="10"
          value={rainfall}
          onChange={(e) => setRainfall(e.target.value)}
          style={{ width: "100%" }}
        />
        <p>Value: {rainfall}</p>

        {/* Drainage */}
        <label>Drainage Systems</label>
        <input
          type="range"
          min="0"
          max="10"
          value={drainage}
          onChange={(e) => setDrainage(e.target.value)}
          style={{ width: "100%" }}
        />
        <p>Value: {drainage}</p>

        {/* Urbanization */}
        <label>Urbanization (from {city})</label>
        <input
          type="range"
          min="0"
          max="10"
          value={cityData[city].urbanization}
          disabled
          style={{ width: "100%" }}
        />
        <p>Value: {cityData[city].urbanization}</p>

        {/* Deforestation */}
        <label>Deforestation</label>
        <input
          type="range"
          min="0"
          max="10"
          value={deforestation}
          onChange={(e) => setDeforestation(e.target.value)}
          style={{ width: "100%" }}
        />
        <p>Value: {deforestation}</p>

        {/* Climate */}
        <label>Climate Change Impact</label>
        <input
          type="range"
          min="0"
          max="10"
          value={climate}
          onChange={(e) => setClimate(e.target.value)}
          style={{ width: "100%" }}
        />
        <p>Value: {climate}</p>

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Predict
        </button>
      </div>
    </div>
  );
}

export default InputPage;