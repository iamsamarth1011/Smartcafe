import { QRCodeCanvas } from "qrcode.react";

const QRPage = () => {
  const restaurantName = import.meta.env.VITE_RESTAURANT_NAME;
  const tableCount = Number(import.meta.env.VITE_TABLE_COUNT || 10);
  const tables = Array.from({ length: tableCount }, (_, index) => index + 1);
  const baseUrl = `${window.location.origin}/menu?table=`;

  return (
    <div className="min-h-screen bg-cream px-6 py-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <h1 className="text-2xl font-semibold">{restaurantName}</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full border border-brand/40 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand"
        >
          Print
        </button>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((tableNumber) => {
          const value = `${baseUrl}${tableNumber}`;
          return (
            <div
              key={tableNumber}
              className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm"
            >
              <h2 className="text-lg font-semibold">Table {tableNumber}</h2>
              <div className="mt-4 rounded-xl bg-cream p-4">
                <QRCodeCanvas value={value} size={140} />
              </div>
              <p className="mt-4 break-all text-xs text-gray-500">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QRPage;
