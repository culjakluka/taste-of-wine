import { Link } from "react-router-dom";

// hooks
import { useCart } from "../../../hooks/useCart";

// utils
import formatPrice from "../../../utils/formatPrice";

// the visitor's favourite wines, as wine-list rows with a Remove button
const FavouriteList = () => {
  const { favourites, removeFavourite } = useCart();

  return (
    <main className="page">
      <h1 className="page-title">Your favourites</h1>

      {favourites.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-state__title">No favourites yet</h2>
          <p>Wines you add to your favourites from a wine's page show up here.</p>
          <Link className="btn" to="/">
            Browse the wine list
          </Link>
        </div>
      )}

      <ul className="wine-rows">
        {favourites.map((wine) => (
          <li className="wine-row" key={wine._id}>
            <div className="leader-line">
              <Link className="wine-row__name" to={`/wine/${wine._id}`}>
                {wine.name} <span className="vintage">{wine.vintage}</span>
              </Link>
              <span className="leader" aria-hidden="true"></span>
              <span className="amount">{formatPrice(wine.price)}</span>
            </div>
            <span className="wine-row__meta">
              {wine.type}, {wine.alcohol}%
            </span>
            <span className="wine-row__admin">
              <button
                className="link-button"
                type="button"
                onClick={() => removeFavourite(wine._id)}
              >
                Remove from favourites
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default FavouriteList;
