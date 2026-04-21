import { useEffect, useMemo, useState } from "react";
import { Coffee, Info } from "lucide-react";
import api from "../utils/api";
import socket from "../utils/socket";

const statusConfig = {
  pending: {
    strip: "bg-amber-500",
    badge: "bg-amber-500/20 text-amber-300",
    action: { label: "Confirm Order", next: "confirmed", button: "bg-blue-600" }
  },
  confirmed: {
    strip: "bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300",
    action: {
      label: "Start Preparing",
      next: "preparing",
      button: "bg-orange-600"
    }
  },
  preparing: {
    strip: "bg-orange-500",
    badge: "bg-orange-500/20 text-orange-300",
    action: { label: "Mark Ready", next: "ready", button: "bg-green-600" }
  },
  ready: {
    strip: "bg-green-500",
    badge: "bg-green-500/20 text-green-300",
    action: null
  }
};

const formatElapsed = (createdAt, now) => {
  const diffMs = now - new Date(createdAt).getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const hours = Math.floor(diffMinutes / 60);
  return `${hours}h ago`;
};

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/active");
        setOrders(data.filter((order) => order.status !== "paid"));
      } catch (error) {
        setOrders([]);
      }
    };

    fetchOrders();

    const handleNewOrder = (order) => {
      if (!order || !order._id) return;
      setOrders((prev) => {
        const exists = prev.some((item) => item._id === order._id);
        if (exists) {
          return prev;
        }
        return [{ ...order, isNew: true }, ...prev];
      });

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((item) =>
            item._id === order._id ? { ...item, isNew: false } : item
          )
        );
      }, 3000);
    };

    const handleStatusUpdate = ({ orderId, status }) => {
      if (!orderId || !status) return;
      setOrders((prev) =>
        prev
          .map((item) =>
            item._id === orderId ? { ...item, status } : item
          )
          .filter((item) => item.status !== "paid")
      );
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_updated", handleStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_updated", handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
    [currentTime]
  );

  const handleStatusAction = async (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((item) =>
        item._id === orderId ? { ...item, status: nextStatus } : item
      )
    );

    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
    } catch (error) {
      setOrders((prev) => prev);
    }
  };

  const activeOrders = orders.filter((order) => order.status !== "paid");

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-white">
              The Golden Fork
            </div>
            <div className="text-sm text-gray-400">Kitchen Display</div>
          </div>
          <div className="text-lg text-gray-300">{formattedTime}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {activeOrders.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-400">
            <Coffee className="h-10 w-10" />
            <p className="text-sm">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const elapsed = formatElapsed(order.createdAt, now);
              return (
                <div
                  key={order._id}
                  className={`rounded-2xl bg-[#2A2A2A] shadow-sm transition ${
                    order.isNew
                      ? "shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      : ""
                  }`}
                >
                  <div className={`h-2 rounded-t-2xl ${config.strip}`} />
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">
                        Table {order.tableNumber}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">{elapsed}</div>

                    <div className="mt-4 space-y-3 text-sm">
                      {order.items.map((item) => (
                        <div
                          key={`${item.menuItemId}-${item.name}`}
                          className="flex items-center justify-between text-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                item.isVeg ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-semibold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.note && (
                      <div className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-amber-100">
                        <div className="flex items-center gap-2 font-semibold">
                          <Info className="h-4 w-4 text-amber-300" />
                          Note
                        </div>
                        <p className="mt-1 text-amber-200">{order.note}</p>
                      </div>
                    )}

                    <div className="mt-5">
                      {config.action ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusAction(order._id, config.action.next)
                          }
                          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${config.action.button}`}
                        >
                          {config.action.label}
                        </button>
                      ) : (
                        <p className="text-center text-sm font-semibold text-green-400">
                          Awaiting pickup
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenPage;
