import { useState } from "react";
import { Link } from "react-router-dom";

// hooks
import { useCart } from "../../../hooks/useCart";

// utils
import formatPrice from "../../../utils/formatPrice";

// the cart, laid out like a bill: one line per wine, then the total
const CartSummary = () => {
  const { cart, setQuantity, removeFromCart, checkout } = useCart();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState(null);

  // the total is worked out from the cart on every render, it is not stored
  let total = 0;
  cart.forEach((line) => {
    total += line.wine.price * line.quantity;
  });

  const handleCheckout = async () => {
    setError(null);

    const success = await checkout();
    if (success) {
      setOrderPlaced(true);
    } else {
      setError("The order wasn't placed. Try again in a moment.");
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">Your cart</h1>

      {orderPlaced && (
        <div className="notice page-notice" role="status">
          Order placed. Your cart is empty again.
        </div>
      )}
      {error && (
        <div className="notice notice--error page-notice" role="alert">
          {error}
        </div>
      )}

      {cart.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-state__title">Your cart is empty</h2>
          <p>Wines you add from the wine list show up here.</p>
          <Link className="btn" to="/">
            Browse the wine list
          </Link>
        </div>
      )}

      {cart.length > 0 && (
        <section className="cart" aria-label="Your cart">
          <ul className="cart__lines">
            {cart.map((line) => (
              <li className="cart__line" key={line.wine._id}>
                <div className="leader-line">
                  <span>
                    {line.wine.name} <span className="vintage">{line.wine.vintage}</span>
                  </span>
                  <span className="leader" aria-hidden="true"></span>
                  <span className="amount">{formatPrice(line.wine.price * line.quantity)}</span>
                </div>

                <div className="cart__controls">
                  <button
                    className="qty-btn"
                    type="button"
                    aria-label="One less"
                    onClick={() => setQuantity(line.wine._id, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span>
                    {line.quantity} × {formatPrice(line.wine.price)}
                  </span>
                  <button
                    className="qty-btn"
                    type="button"
                    aria-label="One more"
                    onClick={() => setQuantity(line.wine._id, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn--text"
                    type="button"
                    onClick={() => removeFromCart(line.wine._id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart__total leader-line">
            <span>Total</span>
            <span className="leader" aria-hidden="true"></span>
            <span className="amount cart__total-amount">{formatPrice(total)}</span>
          </div>

          <button className="btn btn--primary btn--block" type="button" onClick={handleCheckout}>
            Check out
          </button>
        </section>
      )}
    </main>
  );
};

export default CartSummary;
