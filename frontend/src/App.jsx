import { Routes, Route, Link } from "react-router-dom";
import { History, QrCode, Receipt, UtensilsCrossed } from "lucide-react";
import MenuPage from "./pages/MenuPage";
import QRPage from "./pages/QRPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import KitchenPage from "./pages/KitchenPage";
import BillingPage from "./pages/BillingPage";
import BillingHistoryPage from "./pages/BillingHistoryPage";
import ErrorBoundary from "./components/ErrorBoundary";

const StaffHome = () => {
  const restaurantName = import.meta.env.VITE_RESTAURANT_NAME;
  const cards = [
    {
      title: "Kitchen Display",
      subtitle: "Live incoming orders",
      icon: UtensilsCrossed,
      to: "/kitchen"
    },
    {
      title: "Billing Counter",
      subtitle: "Settle tables quickly",
      icon: Receipt,
      to: "/billing"
    },
    {
      title: "QR Codes",
      subtitle: "Print table QR posters",
      icon: QrCode,
      to: "/qr"
    },
    {
      title: "Billing History",
      subtitle: "View settled tables",
      icon: History,
      to: "/billing-history"
    }
  ];

  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-semibold">
          {restaurantName} — Staff Panel
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          Manage orders, billing, and QR codes.
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className="group rounded-2xl border border-transparent bg-white p-6 shadow-sm transition hover:border-brand/60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<StaffHome />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/qr" element={<QRPage />} />
        <Route path="/order-status" element={<OrderStatusPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/billing-history" element={<BillingHistoryPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
