import { Routes, Route } from "react-router-dom";
import InputPage from "./inputPage.js";
import ResultPage from "./resultPage";

function App()
{
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}

export default App;