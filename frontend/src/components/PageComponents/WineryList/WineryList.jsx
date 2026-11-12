import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";

// api requests
import api from "../../../utils/api";

// my components
import WineryLogo from "../../InputComponents/WineryLogo/WineryLogo";

const WineryList = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const location = useLocation();

  const [wineries, setWineries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // load wineries when the page opens
  useEffect(() => {
    const fetchWineries = async () => {
      try {
        // the token is added by the interceptor in utils/api.js
        const response = await api.get("/winery");
        setWineries(response.data);
      } catch (error) {
        // server rejected the token -> back to login
        if (error.response?.status === 401) {
          logout(true);
          return;
        }

        console.error("Error fetching wineries:", error);
        setError("The wineries didn't load. Refresh the page to try again.");
      }
      setIsLoading(false);
    };

    fetchWineries();
  }, [user]);

  return (
    <main className="page">
      <h1 className="page-title">Wineries</h1>

      {/* a message from the page we came from, e.g. "Winery deleted." */}
      {location.state?.notice && (
        <div className="notice page-notice" role="status">
          {location.state.notice}
        </div>
      )}

      {isLoading && <p>Loading the wineries.</p>}
      {error && (
        <div className="notice notice--error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && wineries.length === 0 && (
        <div className="empty-state">
          <h2 className="empty-state__title">No wineries yet</h2>
          <p>Wineries show up here once an admin adds them.</p>
        </div>
      )}

      <ul className="winery-list">
        {wineries.map((winery) => (
          <li className="winery-card" key={winery._id}>
            <WineryLogo name={winery.name} logoUrl={winery.logoUrl} small />
            <div>
              <h2 className="winery-section__name">
                <Link to={`/winery/${winery._id}`}>{winery.name}</Link>
              </h2>
              <p className="winery-profile__facts">
                {winery.country}, founded {winery.foundedYear}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default WineryList;
