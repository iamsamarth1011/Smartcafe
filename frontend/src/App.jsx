import { Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import QRPage from "./pages/QRPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/qr" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/qr" element={<QRPage />} />
    </Routes>
  );
};

export default App;
