import { Link, NavLink } from "react-router-dom";

// hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useLogout } from "../../../hooks/useLogout";
import { useCart } from "../../../hooks/useCart";

const SiteHeader = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { cartCount } = useCart();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          Taste of Wine
        </Link>

        {/* NavLink marks the link of the current page (aria-current="page") */}
        {user && (
          <nav className="site-nav" aria-label="Main">
            <NavLink to="/" end>
              Wine list
            </NavLink>
            <NavLink to="/wineries">Wineries</NavLink>
            <NavLink to="/favourites">Favourites</NavLink>
            <NavLink to="/cart">
              Cart
              {/* the count is hidden when the cart is empty, never shown as 0 */}
              {cartCount > 0 && (
                <span className="cart-count" aria-label={`${cartCount} bottles`}>
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* only admins see these; visitors don't get them even disabled */}
            {user.role === "admin" && <NavLink to="/wine/new">Add wine</NavLink>}
            {user.role === "admin" && <NavLink to="/winery/new">Add winery</NavLink>}
            {user.role === "admin" && <NavLink to="/users">Users</NavLink>}

            <span className="site-nav__user">{user.username}</span>
            <button className="site-nav__button" onClick={() => logout()}>
              Log out
            </button>
          </nav>
        )}

        {!user && (
          <nav className="site-nav" aria-label="Main, signed out">
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/signup">Register</NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

export default SiteHeader;
