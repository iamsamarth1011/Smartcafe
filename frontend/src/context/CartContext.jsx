import { createContext, useContext, useMemo, useReducer, useState } from "react";

const CartContext = createContext(null);

const initialState = {
  items: []
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) => item._id === action.payload._id
      );

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    case "INCREMENT": {
      return {
        ...state,
        items: state.items.map((item) =>
          item._id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    case "DECREMENT": {
      return {
        ...state,
        items: state.items
          .map((item) =>
            item._id === action.payload
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0)
      };
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload)
      };
    }
    case "CLEAR_CART": {
      return initialState;
    }
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [tableNumber, setTableNumber] = useState(null);

  const totalItems = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items]
  );

  const totalPrice = useMemo(
    () =>
      state.items.reduce((total, item) => total + item.quantity * item.price, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      cartItems: state.items,
      totalItems,
      totalPrice,
      tableNumber,
      setTableNumber,
      addItem: (item) => dispatch({ type: "ADD_ITEM", payload: item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
      increment: (id) => dispatch({ type: "INCREMENT", payload: id }),
      decrement: (id) => dispatch({ type: "DECREMENT", payload: id }),
      clearCart: () => dispatch({ type: "CLEAR_CART" })
    }),
    [state.items, tableNumber, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
