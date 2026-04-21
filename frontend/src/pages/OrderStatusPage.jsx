import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Clock,
  Receipt,
  UtensilsCrossed
} from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";
import SkeletonCard from "../components/SkeletonCard";

const statusConfig = {
  pending: {
    label: "Order Received",
    icon: Clock,
    color: "text-amber-500",
    pulse: true
  },
  confirmed: {
    label: "Order Confirmed",
    icon: CheckCircle2,
    color: "text-blue-500",
    pulse: false
  },
  preparing: {
    label: "Being Prepared",
    icon: UtensilsCrossed,
    color: "text-orange-500",
    pulse: true
  },
  ready: {
    label: "Ready! Enjoy your meal",
    icon: Bell,
    color: "text-green-500",
    pulse: false
  },
  paid: {
    label: "Bill Settled",
    icon: Receipt,
    color: "text-gray-500",
    pulse: false
  }
};

const OrderStatusPage = () => {
  const restaurantName = import.meta.env.VITE_RESTAURANT_NAME;
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const id = searchParams.get("orderId");
  const tableNumber = Number(tableParam);

  const [order, setOrder] = useState({ items: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      setError("");
    } catch (fetchError) {
      setError("Unable to load order status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Invalid order. Please return to the menu.");
      setIsLoading(false);
      return;
    }

    fetchOrder();
  }, [id]);

  useEffect(() => {
    const handleStatusUpdate = ({ orderId, status }) => {
      console.log(
        "Received order_status_updated:",
        orderId,
        status,
        "| current id:",
        id
      );
      if (String(orderId) === String(id)) {
        setOrder((prev) => ({ ...prev, status }));
      }
    };
    socket.on("order_status_updated", handleStatusUpdate);
    return () => socket.off("order_status_updated", handleStatusUpdate);
  }, [id]);

  const status = order?.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const totalAmount = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [order]);

  if (!id || !Number.isInteger(tableNumber) || tableNumber <= 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="text-lg font-semibold text-gray-700">
          Invalid order. Please return to the menu.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-16">
      <header className="sticky top-0 z-30 border-b border-brand/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold">{restaurantName}</h1>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1 text-sm font-semibold text-brand">
            Table {tableNumber}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center">
        {isLoading ? (
          <div className="w-full max-w-xl">
            <SkeletonCard lines={4} />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm md:h-16 md:w-16 ${
                  config.pulse ? "animate-pulse" : ""
                }`}
              >
                <StatusIcon className={`h-10 w-10 md:h-8 md:w-8 ${config.color}`} />
              </div>
              <h2 className="text-2xl font-semibold">{config.label}</h2>
            </div>

            <div className="mt-10 w-full rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <div className="mt-2 text-left">
                <p className="text-sm font-medium text-gray-800">
                  Order for: {order.customerName}
                </p>
                <p className="text-xs text-gray-500">{order.customerPhone}</p>
              </div>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${item.menuItemId}-${item.name}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-brand">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">Order total</p>
                <p className="text-lg font-semibold text-brand">
                  ${(order.totalAmount ?? totalAmount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Order ID: {order._id}</p>
              <p>Table: {order.tableNumber}</p>
            </div>

            <Link
              to={`/menu?table=${tableNumber}`}
              className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Back to Menu
            </Link>
          </>
        )}
      </main>
    </div>
  );
};

export default OrderStatusPage;
