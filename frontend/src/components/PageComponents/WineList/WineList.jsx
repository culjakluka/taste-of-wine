import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";
import { useCart } from "../../../hooks/useCart";

// api requests
import api from "../../../utils/api";

const WineList = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { isFavourite } = useCart();

  const [wines, setWines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // a message to show above the list: starts as the one sent by the page
  // we came from (e.g. "Wine deleted."), and changes after a delete here
  const location = useLocation();
  const [notice, setNotice] = useState(location.state?.notice);

  // load wines when the page opens
  useEffect(() => {
    const fetchWines = async () => {
      try {
        // the token is added by the interceptor in utils/api.js
        const response = await api.get("/wine");
        setWines(response.data);
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        console.error("Error fetching wines:", error);
        setError("The wine list didn't load. Refresh the page to try again.");
      }
      setIsLoading(false);
    };

    fetchWines();
  }, [user]);

  // delete a wine straight from the list (admin)
  const handleDelete = async (wine) => {
    if (!window.confirm(`Delete ${wine.name}?`)) {
      return;
    }

    try {
      await api.delete(`/wine/${wine._id}`);

      // take it out of the list in state, no page reload needed
      setWines(wines.filter((w) => w._id !== wine._id));
      setNotice("Wine deleted.");
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      console.error("Error deleting wine:", error);
      setError(`${wine.name} wasn't deleted. Try again in a moment.`);
    }
  };

  // the server sends wines sorted by winery, so wines of the same winery
  // come one after another: start a new section whenever the winery changes
  const sections = [];
  wines.forEach((wine) => {
    const lastSection = sections[sections.length - 1];
    if (lastSection && lastSection.winery._id === wine.winery._id) {
      lastSection.wines.push(wine);
    } else {
      sections.push({ winery: wine.winery, wines: [wine] });
    }
  });

  return (
    <main className="page">
      <h1 className="page-title">The wine list</h1>

      {notice && (
        <div className="notice page-notice" role="status">
          {notice}
        </div>
      )}

      {isLoading && <p>Loading the wine list.</p>}
      {error && (
        <div className="notice notice--error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && wines.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-state__title">No wines yet</h2>
          <p>Wines show up here once an admin adds them.</p>
        </div>
      )}

      {sections.map((section) => (
        <section className="winery-section" key={section.winery._id}>
          <div className="winery-section__head">
            <h2 className="winery-section__name">
              <Link to={`/winery/${section.winery._id}`}>{section.winery.name}</Link>
            </h2>
            <span className="winery-section__region">{section.winery.region}</span>
          </div>

          <ul className="wine-rows">
            {section.wines.map((wine) => (
              <li className="wine-row" key={wine._id}>
                <div className="leader-line">
                  <Link className="wine-row__name" to={`/wine/${wine._id}`}>
                    {wine.name} <span className="vintage">{wine.vintage}</span>
                  </Link>
                  {isFavourite(wine._id) && (
                    <span className="fav-mark" aria-label="In your favourites">
                      ♥
                    </span>
                  )}
                  <span className="leader" aria-hidden="true"></span>
                  <span className="amount">€{wine.price}</span>
                </div>
                <span className="wine-row__meta">
                  {wine.type}, {wine.alcohol}%
                </span>

                {/* only admins see these; the server checks the role too */}
                {user.role === "admin" && (
                  <span className="wine-row__admin">
                    <Link to={`/wine/${wine._id}/edit`}>Edit</Link>
                    <button
                      className="link-button link-button--danger"
                      type="button"
                      onClick={() => handleDelete(wine)}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
};

export default WineList;
