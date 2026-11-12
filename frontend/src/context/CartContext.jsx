import { createContext, useReducer, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import api from "../utils/api";

// Holds the logged-in user's cart and favourites, so the header (cart count),
// the wine list (hearts) and the cart page all read the same data.
export const CartContext = createContext();

export const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload };
    case "SET_FAVOURITES":
      return { ...state, favourites: action.payload };
    case "CLEAR":
      return { cart: [], favourites: [] };
    default:
      return state;
  }
};

export const CartContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [], favourites: [] });
  const { user } = useAuthContext();

  // when someone logs in, load their cart and favourites from the server;
  // when they log out, empty both
  useEffect(() => {
    const fetchCartAndFavourites = async () => {
      try {
        const cartResponse = await api.get("/cart");
        dispatch({ type: "SET_CART", payload: cartResponse.data });

        const favouritesResponse = await api.get("/favourite");
        dispatch({ type: "SET_FAVOURITES", payload: favouritesResponse.data });
      } catch (error) {
        console.error("Error fetching cart and favourites:", error);
      }
    };

    if (user) {
      fetchCartAndFavourites();
    } else {
      dispatch({ type: "CLEAR" });
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};
