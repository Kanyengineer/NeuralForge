import { Routes, Route } from "react-router-dom";
import InputPage from "./inputPage.jsx";
import ResultPage from "./resultPage.jsx";
import Dashboard from "./dashboardPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
