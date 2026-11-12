import { useState } from "react";
import { Link } from "react-router-dom";

// hooks
import { useSignup } from "../../../hooks/useSignup";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, error, isLoading } = useSignup();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await signup(username, email, password);
  };

  return (
    <main className="page">
      <h1 className="page-title">Register</h1>

      <form className="form" onSubmit={handleSubmit}>
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
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            className="field__control"
            id="email"
            type="email"
            placeholder="ana@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            aria-describedby="password-help"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="field__help" id="password-help">
            At least 8 characters, with an uppercase letter, a number and a symbol.
          </span>
        </div>

        {error && (
          <div className="notice notice--error" role="alert">
            {error}
          </div>
        )}

        <div className="action-row">
          <button className="btn btn--primary" type="submit" disabled={isLoading}>
            Register
          </button>
          <Link to="/login">Log in instead</Link>
        </div>
      </form>
    </main>
  );
};

export default SignupForm;
