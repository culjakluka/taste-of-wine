import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useLogout } from "./useLogout";
import api from "../utils/api";

// Gives a component the cart, the favourites and the functions that change them.
// Every function asks the server first; the server answers with the new list,
// and that list goes into the context. Each returns true if it worked.
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw Error("useCart must be used inside a CartContextProvider");
  }

  const { cart, favourites, dispatch } = context;
  const { logout } = useLogout();

  // what to do when a request fails
  const handleError = (error) => {
    // server rejected the token -> back to login
    if (error.response?.status === 401) {
      logout(true);
    } else {
      console.error("Cart request failed:", error);
    }
    return false;
  };

  // one more bottle of this wine
  const addToCart = async (wineId) => {
    try {
      const response = await api.post(`/cart/${wineId}`);
      dispatch({ type: "SET_CART", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  // set how many bottles of this wine (0 removes it)
  const setQuantity = async (wineId, quantity) => {
    try {
      const response = await api.patch(`/cart/${wineId}`, { quantity });
      dispatch({ type: "SET_CART", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  const removeFromCart = async (wineId) => {
    try {
      const response = await api.delete(`/cart/${wineId}`);
      dispatch({ type: "SET_CART", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  // the server empties the cart and answers with an empty list
  const checkout = async () => {
    try {
      const response = await api.post("/cart/checkout");
      dispatch({ type: "SET_CART", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  const addFavourite = async (wineId) => {
    try {
      const response = await api.post(`/favourite/${wineId}`);
      dispatch({ type: "SET_FAVOURITES", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  const removeFavourite = async (wineId) => {
    try {
      const response = await api.delete(`/favourite/${wineId}`);
      dispatch({ type: "SET_FAVOURITES", payload: response.data });
      return true;
    } catch (error) {
      return handleError(error);
    }
  };

  // is this wine in my favourites?
  const isFavourite = (wineId) => {
    return favourites.some((wine) => wine._id === wineId);
  };

  // number of bottles in the cart (for the count in the header)
  let cartCount = 0;
  cart.forEach((line) => {
    cartCount += line.quantity;
  });

  return {
    cart,
    favourites,
    cartCount,
    addToCart,
    setQuantity,
    removeFromCart,
    checkout,
    addFavourite,
    removeFavourite,
    isFavourite,
  };
};
