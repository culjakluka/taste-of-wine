import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";
import api from "../utils/api";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // axios turns the object into JSON and parses the answer for us
      const response = await api.post("/user/login", { username, password });
      const json = response.data;

      // save the user (username, userId, role, token) to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // update the auth context
      dispatch({ type: "LOGIN", payload: json });

      // after login -> home page (the wine list)
      navigate("/");
    } catch (error) {
      // axios throws for every status outside 2xx, so errors land here
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError("The server can't be reached. Try again in a moment.");
      }
    }

    setIsLoading(false);
  };

  return { login, isLoading, error };
};
