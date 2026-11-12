import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import SiteHeader from "./components/PageComponents/SiteHeader/SiteHeader";
import HomePage from "./pages/HomePage/HomePage";
import WineDetailPage from "./pages/WineDetailPage/WineDetailPage";
import WineFormPage from "./pages/WineFormPage/WineFormPage";
import WineriesPage from "./pages/WineriesPage/WineriesPage";
import WineryPage from "./pages/WineryPage/WineryPage";
import WineryFormPage from "./pages/WineryFormPage/WineryFormPage";
import CartPage from "./pages/CartPage/CartPage";
import FavouritesPage from "./pages/FavouritesPage/FavouritesPage";
import UsersPage from "./pages/UsersPage/UsersPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";

function App() {
  const { user } = useAuthContext();
  const isAdmin = user?.role === "admin";

  return (
    <div className="App">
      <BrowserRouter>
        <SiteHeader />
        <Routes>
          {/* logged-in users */}
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route
            path="/wine/:id"
            element={user ? <WineDetailPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/wineries"
            element={user ? <WineriesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/winery/:id"
            element={user ? <WineryPage /> : <Navigate to="/login" />}
          />
          <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
          <Route
            path="/favourites"
            element={user ? <FavouritesPage /> : <Navigate to="/login" />}
          />

          {/* admin only (the server checks the role too) */}
          <Route path="/wine/new" element={isAdmin ? <WineFormPage /> : <Navigate to="/" />} />
          <Route
            path="/wine/:id/edit"
            element={isAdmin ? <WineFormPage /> : <Navigate to="/" />}
          />
          <Route
            path="/winery/new"
            element={isAdmin ? <WineryFormPage /> : <Navigate to="/" />}
          />
          <Route
            path="/winery/:id/edit"
            element={isAdmin ? <WineryFormPage /> : <Navigate to="/" />}
          />
          <Route path="/users" element={isAdmin ? <UsersPage /> : <Navigate to="/" />} />

          {/* guests only */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
