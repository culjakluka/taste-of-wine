import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (username, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/user/signup", { username, email, password });

      // after registering -> login page (state tells it to show a notice)
      navigate("/login", { state: { registered: true } });
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

  return { signup, isLoading, error };
};
