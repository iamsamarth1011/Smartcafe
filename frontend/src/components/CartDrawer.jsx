import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../utils/api";

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cartItems,
    totalPrice,
    increment,
    decrement,
    clearCart,
    tableNumber
  } = useCart();
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      setError("Table number is missing. Please rescan your QR code.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const items = cartItems.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isVeg: item.isVeg
      }));

      const { data } = await api.post("/orders", {
        tableNumber,
        items,
        note: note.trim() || undefined
      });

      clearCart();
      setNote("");
      onClose();
      navigate(`/order-status?table=${tableNumber}&orderId=${data._id}`);
    } catch (requestError) {
      setError("Unable to place the order right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-white shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">Your Order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-1 text-sm transition hover:border-gray-300"
          >
            Close
          </button>
        </div>

        <div className="max-h-[55vh] space-y-4 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} each
                  </p>
                  <p className="text-sm text-gray-700">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-brand/30 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => decrement(item._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm transition hover:border-gray-300"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(item._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm transition hover:border-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Order total</p>
            <p className="text-lg font-semibold text-brand">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          <label className="mt-4 block text-sm font-medium text-gray-700">
            Add a note for kitchen
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={200}
            placeholder="E.g. less spicy, no onions…"
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition focus:border-brand/50 focus:outline-none"
            rows={3}
          />
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || cartItems.length === 0 || !tableNumber}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-brand bg-brand/10 py-3 text-sm font-semibold text-brand transition hover:bg-brand/20 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            )}
            {isSubmitting ? "Placing..." : "Place Order"}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
