import { Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import QRPage from "./pages/QRPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import KitchenPage from "./pages/KitchenPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/qr" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/qr" element={<QRPage />} />
      <Route path="/order-status" element={<OrderStatusPage />} />
      <Route path="/kitchen" element={<KitchenPage />} />
    </Routes>
  );
};

export default App;
