import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";
import { useCart } from "../../../hooks/useCart";

// api requests
import api from "../../../utils/api";

const WineDetail = () => {
  const { id } = useParams(); // the :id part of /wine/:id
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  // set by the wine form after saving
  const location = useLocation();
  const notice = location.state?.notice;

  const [wine, setWine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // cart and favourites come from the shared cart context
  const { addToCart, addFavourite, removeFavourite, isFavourite } = useCart();
  const [cartNotice, setCartNotice] = useState(null);

  // load the wine when the page opens (and again if the id in the url changes)
  useEffect(() => {
    const fetchWine = async () => {
      try {
        // the token is added by the interceptor in utils/api.js
        const response = await api.get(`/wine/${id}`);
        setWine(response.data);
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        if (error.response?.status === 404) {
          setError("This wine isn't on the list any more.");
        } else {
          console.error("Error fetching wine:", error);
          setError("The wine didn't load. Refresh the page to try again.");
        }
      }
      setIsLoading(false);
    };

    fetchWine();
  }, [id, user]);

  const handleAddToCart = async () => {
    const success = await addToCart(wine._id);
    if (success) {
      setCartNotice("Added to your cart.");
    }
  };

  // in favourites -> take it out, not in favourites -> put it in
  const handleToggleFavourite = async () => {
    if (isFavourite(wine._id)) {
      await removeFavourite(wine._id);
    } else {
      await addFavourite(wine._id);
    }
  };

  // delete the wine (admin)
  const handleDelete = async () => {
    if (!window.confirm(`Delete ${wine.name}?`)) {
      return;
    }

    try {
      await api.delete(`/wine/${id}`);

      // the wine is gone, so go back to the list and say so there
      navigate("/", { state: { notice: "Wine deleted." } });
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      console.error("Error deleting wine:", error);
      setError("The wine wasn't deleted. Try again in a moment.");
    }
  };

  return (
    <main className="page page--wide">
      {/* a message from the page we came from, e.g. "Wine saved." */}
      {notice && (
        <div className="notice page-notice" role="status">
          {notice}
        </div>
      )}

      {isLoading && <p>Loading the wine.</p>}
      {error && (
        <div className="notice notice--error" role="alert">
          {error} <Link to="/">Back to the wine list</Link>
        </div>
      )}

      {wine && (
        <div className="wine-detail">
          <div>
            <p className="wine-detail__winery">
              <Link to={`/winery/${wine.winery._id}`}>{wine.winery.name}</Link>
            </p>
            <h1 className="wine-detail__name">
              {wine.name} <span className="vintage">{wine.vintage}</span>
            </h1>
            {wine.description && <p className="wine-detail__text">{wine.description}</p>}
            <Link to="/">Back to the wine list</Link>
          </div>

          <aside className="spec-panel" aria-label="Details">
            <div className="spec-panel__price">€{wine.price}</div>

            {/* a spec the wine doesn't have is left out, never shown empty */}
            <dl className="spec-list">
              <div className="leader-line">
                <dt>Type</dt>
                <span className="leader" aria-hidden="true"></span>
                <dd>{wine.type}</dd>
              </div>
              {wine.colour && (
                <div className="leader-line">
                  <dt>Colour</dt>
                  <span className="leader" aria-hidden="true"></span>
                  <dd>{wine.colour}</dd>
                </div>
              )}
              <div className="leader-line">
                <dt>Alcohol</dt>
                <span className="leader" aria-hidden="true"></span>
                <dd>{wine.alcohol}%</dd>
              </div>
              {wine.region && (
                <div className="leader-line">
                  <dt>Region</dt>
                  <span className="leader" aria-hidden="true"></span>
                  <dd>{wine.region}</dd>
                </div>
              )}
            </dl>

            <div className="action-row">
              <button className="btn btn--primary" type="button" onClick={handleAddToCart}>
                Add to cart
              </button>

              {/* one button that switches between the two states */}
              <button
                className="btn"
                type="button"
                aria-pressed={isFavourite(wine._id)}
                onClick={handleToggleFavourite}
              >
                {isFavourite(wine._id) ? (
                  <>
                    <span className="fav-glyph" aria-hidden="true">
                      ♥
                    </span>{" "}
                    In favourites
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">♡</span> Add to favourites
                  </>
                )}
              </button>
            </div>
            {cartNotice && (
              <p className="spec-panel__notice" role="status">
                {cartNotice} <Link to="/cart">See your cart</Link>
              </p>
            )}

            {/* only admins see these; the server checks the role too */}
            {user.role === "admin" && (
              <div className="action-row spec-panel__admin">
                <Link className="btn" to={`/wine/${wine._id}/edit`}>
                  Edit wine
                </Link>
                <button className="btn btn--danger" type="button" onClick={handleDelete}>
                  Delete wine
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
};

export default WineDetail;
