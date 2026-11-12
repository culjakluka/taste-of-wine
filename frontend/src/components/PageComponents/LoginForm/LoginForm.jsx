import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// hooks
import { useLogin } from "../../../hooks/useLogin";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useLogin();

  // set by useSignup / useLogout when they send the visitor here
  const location = useLocation();
  const registered = location.state?.registered;
  const sessionEnded = location.state?.sessionEnded;

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(username, password);
  };

  return (
    <main className="page">
      <h1 className="page-title">Log in</h1>

      <form className="form" onSubmit={handleSubmit}>
        {registered && (
          <div className="notice" role="status">
            Account created. Log in to see the wine list.
          </div>
        )}
        {sessionEnded && (
          <div className="notice" role="status">
            Your session has ended. Log in again to continue.
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="username">
            Username
          </label>
          <input
            className="field__control"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <input
            className="field__control"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="notice notice--error" role="alert">
            {error}
          </div>
        )}

        <div className="action-row">
          <button className="btn btn--primary" type="submit" disabled={isLoading}>
            Log in
          </button>
          <Link to="/signup">Register instead</Link>
        </div>
      </form>
    </main>
  );
};

export default LoginForm;
