import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  // sessionEnded is true when the server rejected our token (401)
  const logout = (sessionEnded = false) => {
    // remove user from storage
    localStorage.removeItem("user");

    dispatch({ type: "LOGOUT" });

    // after logout -> login page (state tells it to show a notice)
    navigate("/login", { state: { sessionEnded: sessionEnded === true } });
  };

  return { logout };
};
