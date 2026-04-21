import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import SkeletonCard from "../components/SkeletonCard";

const PAGE_SIZE = 20;

const BillingHistoryPage = () => {
  const tableCount = Number(import.meta.env.VITE_TABLE_COUNT || 10);
  const [tableFilter, setTableFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setCurrentPage(1);
      try {
        const params = {};
        if (tableFilter) params.tableNumber = tableFilter;
        if (dateFilter) params.date = dateFilter;
        const { data } = await api.get("/orders/history", { params });
        setOrders(data.orders || []);
      } catch (error) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [tableFilter, dateFilter]);

  const totalRevenue = useMemo(
    () => orders.reduce((total, order) => total + order.totalAmount, 0),
    [orders]
  );

  const totalPages = Math.max(Math.ceil(orders.length / PAGE_SIZE), 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageOrders = orders.slice(startIndex, startIndex + PAGE_SIZE);
  const showingStart = orders.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(startIndex + pageOrders.length, orders.length);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to="/billing"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-brand/60"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold">Billing History</h1>
            <p className="text-sm text-gray-500">All settled tables</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <select
            value={tableFilter}
            onChange={(event) => setTableFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">All Tables</option>
            {Array.from({ length: tableCount }, (_, index) => index + 1).map(
              (tableNumber) => (
                <option key={tableNumber} value={tableNumber}>
                  Table {tableNumber}
                </option>
              )
            )}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            onClick={() => {
              setTableFilter("");
              setDateFilter("");
            }}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-700"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-gray-600">
            Total orders shown: <span className="font-semibold">{orders.length}</span>
          </p>
          <p className="text-lg font-semibold text-brand">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} lines={3} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 text-gray-500 shadow-sm">
            <ReceiptText className="h-10 w-10" />
            <p className="text-sm">No billing history found</p>
            <Link
              to="/billing"
              className="rounded-full border border-brand/40 px-5 py-2 text-sm font-semibold text-brand transition hover:border-brand"
            >
              View Active Billing
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pageOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white">
                      Table {order.tableNumber}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customerPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-gray-600 md:px-6">
                    <p className="truncate">
                      {order.items
                        .map((item) => `${item.name} x${item.quantity}`)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-brand">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Settled{" "}
                      {new Date(order.updatedAt).toLocaleString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={safePage === 1}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-brand/60 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <p className="text-sm text-gray-500">
                Showing {showingStart}–{showingEnd} of {orders.length}
              </p>
              <button
                type="button"
                onClick={handleNext}
                disabled={safePage === totalPages}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-brand/60 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BillingHistoryPage;
