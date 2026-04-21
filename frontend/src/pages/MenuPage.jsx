import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import api from "../utils/api";

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const tableNumber = tableParam && !Number.isNaN(Number(tableParam))
    ? tableParam
    : null;

  const [itemsByCategory, setItemsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { cartItems, totalItems, totalPrice, addItem, increment, decrement } =
    useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await api.get("/menu");
        const grouped = data.itemsByCategory || {};
        const categoryList = data.categories || Object.keys(grouped);
        setItemsByCategory(grouped);
        setCategories(categoryList);
      } catch (fetchError) {
        setError("Unable to load the menu right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const allItems = useMemo(
    () => Object.values(itemsByCategory).flat(),
    [itemsByCategory]
  );

  const visibleItems = useMemo(() => {
    if (activeCategory === "All") {
      return allItems;
    }
    return itemsByCategory[activeCategory] || [];
  }, [activeCategory, allItems, itemsByCategory]);

  if (!tableNumber) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-center">
        <p className="text-lg font-semibold text-gray-700">
          Invalid table. Please scan the QR code at your table.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="sticky top-0 z-30 border-b border-brand/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-semibold">The Golden Fork</h1>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1 text-sm font-semibold text-brand">
            Table {tableNumber}
          </span>
        </div>
        <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-6 pb-4">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "border-brand bg-brand text-white"
                  : "border-brand/30 bg-white text-gray-700 hover:border-brand"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading menu...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {visibleItems.map((item) => {
              const cartItem = cartItems.find(
                (cart) => cart._id === item._id
              );
              const quantity = cartItem ? cartItem.quantity : 0;
              const isAvailable = item.isAvailable !== false;

              return (
                <div
                  key={item._id}
                  className={`flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm transition ${
                    isAvailable ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <div className="relative mb-3 h-32 overflow-hidden rounded-xl">
                    <img
                      src={item.image || "https://placehold.co/400x300"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                    {!isAvailable && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.isVeg ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <p className="text-sm text-gray-500">
                      {item.isVeg ? "Veg" : "Non-veg"}
                    </p>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-brand">
                      ${item.price.toFixed(2)}
                    </span>
                    {quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        disabled={!isAvailable}
                        className="rounded-full border border-brand/40 px-4 py-2 text-sm font-semibold text-brand transition hover:border-brand disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-full border border-brand/30 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => decrement(item._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm transition hover:border-gray-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item._id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-sm transition hover:border-gray-300"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">{totalItems} items</p>
            <p className="text-lg font-semibold text-brand">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            View Order
          </button>
        </div>
      </div>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};

export default MenuPage;
