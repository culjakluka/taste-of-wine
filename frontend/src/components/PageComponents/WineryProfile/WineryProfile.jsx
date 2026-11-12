import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

// api requests
import api from "../../../utils/api";

// my components
import WineryLogo from "../../InputComponents/WineryLogo/WineryLogo";

const WineryProfile = () => {
  const { id } = useParams(); // the :id part of /winery/:id
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();

  // set by the winery form after saving
  const location = useLocation();
  const notice = location.state?.notice;

  const [winery, setWinery] = useState(null);
  const [wines, setWines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // why a delete was refused: { title, text }
  const [deleteError, setDeleteError] = useState(null);

  // load the winery and its wines when the page opens
  useEffect(() => {
    const fetchWinery = async () => {
      try {
        // the token is added by the interceptor in utils/api.js
        const response = await api.get(`/winery/${id}`);

        // the server sends both in one answer: { winery, wines }
        setWinery(response.data.winery);
        setWines(response.data.wines);
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        if (error.response?.status === 404) {
          setError("This winery isn't listed any more.");
        } else {
          console.error("Error fetching winery:", error);
          setError("The winery didn't load. Refresh the page to try again.");
        }
      }
      setIsLoading(false);
    };

    fetchWinery();
  }, [id, user]);

  // delete the winery (admin)
  const handleDelete = async () => {
    if (!window.confirm(`Delete ${winery.name}?`)) {
      return;
    }
    setDeleteError(null);

    try {
      await api.delete(`/winery/${id}`);

      // the winery is gone, so go back to the wineries and say so there
      navigate("/wineries", { state: { notice: "Winery deleted." } });
    } catch (error) {
      if (error.response?.status === 401) {
        logout(true);
        return;
      }

      // 409: the server refuses to delete a winery that still has wines
      if (error.response?.status === 409) {
        const wineCount = error.response.data.wineCount;
        setDeleteError({
          title: `${winery.name} wasn't deleted`,
          text: `It still has ${wineCount} ${wineCount === 1 ? "wine" : "wines"}. Delete or move them to another winery first.`,
        });
      } else {
        console.error("Error deleting winery:", error);
        setDeleteError({
          title: `${winery.name} wasn't deleted`,
          text: "Try again in a moment.",
        });
      }
    }
  };

  return (
    <main className="page page--wide">
      {/* a message from the page we came from, e.g. "Winery saved." */}
      {notice && (
        <div className="notice page-notice" role="status">
          {notice}
        </div>
      )}
      {deleteError && (
        <div className="notice notice--error page-notice" role="alert">
          <span className="notice__title">{deleteError.title}</span>
          {deleteError.text}
        </div>
      )}

      {isLoading && <p>Loading the winery.</p>}
      {error && (
        <div className="notice notice--error" role="alert">
          {error} <Link to="/wineries">Back to the wineries</Link>
        </div>
      )}

      {winery && (
        <>
          <div className="winery-profile">
            <WineryLogo name={winery.name} logoUrl={winery.logoUrl} />
            <div>
              <h1 className="winery-profile__name">{winery.name}</h1>
              <p className="winery-profile__facts">
                {winery.country}, founded {winery.foundedYear}, {wines.length}{" "}
                {wines.length === 1 ? "wine" : "wines"}
              </p>
              {winery.description && (
                <p className="winery-profile__text">{winery.description}</p>
              )}

              {/* only admins see these; the server checks the role too */}
              {user.role === "admin" && (
                <div className="action-row winery-profile__actions">
                  <Link className="btn" to={`/winery/${winery._id}/edit`}>
                    Edit winery
                  </Link>
                  <button className="btn btn--danger" type="button" onClick={handleDelete}>
                    Delete winery
                  </button>
                </div>
              )}
            </div>
          </div>

          <section className="winery-wines">
            <h2 className="winery-section__name">Wines</h2>

            {wines.length === 0 && <p>This winery has no wines on the list yet.</p>}

            <ul className="wine-rows">
              {wines.map((wine) => (
                <li className="wine-row" key={wine._id}>
                  <div className="leader-line">
                    <Link className="wine-row__name" to={`/wine/${wine._id}`}>
                      {wine.name} <span className="vintage">{wine.vintage}</span>
                    </Link>
                    <span className="leader" aria-hidden="true"></span>
                    <span className="amount">€{wine.price}</span>
                  </div>
                  <span className="wine-row__meta">
                    {wine.type}, {wine.alcohol}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
};

export default WineryProfile;
