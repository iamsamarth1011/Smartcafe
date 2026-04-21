import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, History, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import socket from "../utils/socket";
import SkeletonCard from "../components/SkeletonCard";

const statusBadgeStyles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  paid: "bg-gray-200 text-gray-600"
};

const BillingPage = () => {
  const [tables, setTables] = useState([]);
  const [occupiedTables, setOccupiedTables] = useState(new Set());
  const [selectedTable, setSelectedTable] = useState(null);
  const [billData, setBillData] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const { data } = await api.get("/tables");
        const sortedTables = [...data].sort(
          (a, b) => a.tableNumber - b.tableNumber
        );
        setTables(sortedTables);
        setOccupiedTables(
          new Set(
            sortedTables
              .filter((table) => table.isOccupied)
              .map((table) => table.tableNumber)
          )
        );
      } catch (error) {
        setTables([]);
      }
    };

    fetchTables();
  }, []);

  const tableNumbers = useMemo(() => {
    if (tables.length > 0) {
      return tables.map((table) => table.tableNumber);
    }
    const tableCount = Number(import.meta.env.VITE_TABLE_COUNT || 10);
    return Array.from({ length: tableCount }, (_, index) => index + 1);
  }, [tables]);

  const fetchBill = useCallback(async (tableNumber) => {
    setBillLoading(true);
    setBillError("");
    setBillData(null);
    setSettled(false);

    try {
      const { data } = await api.get(`/orders/bill/${tableNumber}`);
      setBillData(data);
      setOccupiedTables((prev) => new Set(prev).add(tableNumber));
    } catch (error) {
      if (error.response?.status === 404) {
        setBillError("no-active");
        setOccupiedTables((prev) => {
          const next = new Set(prev);
          next.delete(tableNumber);
          return next;
        });
      } else {
        setBillError("error");
      }
    } finally {
      setBillLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleNewOrder = (order) => {
      if (!order?.tableNumber) return;
      setOccupiedTables((prev) => new Set(prev).add(order.tableNumber));
      if (selectedTable === order.tableNumber) {
        fetchBill(order.tableNumber);
        toast(`New item added to Table ${order.tableNumber}`, { icon: "🍽️" });
      }
    };

    const handleTablePaid = ({ tableNumber }) => {
      if (!tableNumber) return;
      setOccupiedTables((prev) => {
        const next = new Set(prev);
        next.delete(tableNumber);
        return next;
      });
      if (selectedTable === tableNumber) {
        setBillData(null);
        setBillError("");
        setBillLoading(false);
        setSettled(true);
      }
    };

    socket.on("new_order", handleNewOrder);
    socket.on("table_paid", handleTablePaid);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("table_paid", handleTablePaid);
    };
  }, [fetchBill, selectedTable]);

  const handleSelectTable = (tableNumber) => {
    setSelectedTable(tableNumber);
    fetchBill(tableNumber);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTable) return;
    setBillLoading(true);
    setShowConfirm(false);

    try {
      await api.patch(`/orders/bill/${selectedTable}/pay`);
      setSettled(true);
      setBillData(null);
      setBillError("");
      toast.success(`Table ${selectedTable} settled successfully!`);
      setOccupiedTables((prev) => {
        const next = new Set(prev);
        next.delete(selectedTable);
        return next;
      });
    } catch (error) {
      setBillError("error");
      toast.error("Failed to settle table. Try again.");
    } finally {
      setBillLoading(false);
    }
  };

  const clearPanel = () => {
    setSelectedTable(null);
    setBillData(null);
    setBillError("");
    setSettled(false);
  };

  const subtotal = billData?.totalAmount || 0;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;
  const firstOrderTime = billData?.orders?.[0]?.createdAt
    ? new Date(billData.orders[0].createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;
  const customerName = billData?.orders?.[0]?.customerName;
  const customerPhone = billData?.orders?.[0]?.customerPhone;

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_2fr]">
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Billing Counter</h1>
            <p className="mt-2 text-sm text-gray-500">
              Select a table to view the bill
            </p>
            <Link
              to="/billing-history"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand/40 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
            >
              <History className="h-4 w-4" />
              View History
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 lg:grid-cols-10">
            {tableNumbers.map((tableNumber) => {
              const isActive = selectedTable === tableNumber;
              const isOccupied = occupiedTables.has(tableNumber);
              return (
                <button
                  key={tableNumber}
                  type="button"
                  onClick={() => handleSelectTable(tableNumber)}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                    isActive
                      ? "border-brand bg-brand text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-brand/60"
                  }`}
                >
                  {tableNumber}
                  {isOccupied && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {!selectedTable ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-gray-400">
              <Receipt className="h-10 w-10" />
              <p className="text-sm">Select a table to view bill</p>
            </div>
          ) : billLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={index} lines={3} />
              ))}
            </div>
          ) : settled ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
              <p className="text-lg font-semibold">
                Table {selectedTable} settled!
              </p>
              <button
                type="button"
                onClick={clearPanel}
                className="rounded-full border border-green-200 bg-green-50 px-5 py-2 text-sm font-semibold text-green-700 transition hover:border-green-300"
              >
                Clear
              </button>
            </div>
          ) : billError === "no-active" ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-gray-500">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm">
                No active orders for Table {selectedTable}
              </p>
            </div>
          ) : billError ? (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-red-600">
              Unable to load bill right now.
            </div>
          ) : billData ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Table {billData.tableNumber}
                </h2>
                {firstOrderTime && (
                  <p className="text-sm text-gray-500">
                    Active since {firstOrderTime}
                  </p>
                )}
                {customerName && customerPhone && (
                  <p className="mt-2 text-sm text-gray-500">
                    Customer: {customerName} — {customerPhone}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {billData.orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">
                        {order._id}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusBadgeStyles[order.status] ||
                          statusBadgeStyles.pending
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {order.items.map((item) => (
                        <div
                          key={`${item.menuItemId}-${item.name}`}
                          className="flex items-center justify-between text-gray-700"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-400">
                              Qty {item.quantity} · ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <span className="font-semibold text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                      <span className="text-gray-500">Order subtotal</span>
                      <span className="font-semibold text-gray-800">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>GST (5%)</span>
                  <span>${gst.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-lg font-semibold text-brand">
                  <span>Grand Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fetchBill(selectedTable)}
                  className="rounded-full border border-brand/40 px-5 py-2 text-sm font-semibold text-brand transition hover:border-brand"
                >
                  Refresh Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
                >
                  Mark as Paid &amp; Clear Table
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {showConfirm && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Settle table</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to settle Table {selectedTable}? This cannot
              be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
