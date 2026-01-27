import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login, checkUsersEmpty } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingUsers, setCheckingUsers] = useState(true);

  useEffect(() => {
    let mounted = true;
    checkUsersEmpty()
      .then((empty) => {
        if (mounted && empty) navigate("/onboard-admin", { replace: true });
      })
      .finally(() => {
        if (mounted) setCheckingUsers(false);
      });
    return () => {
      mounted = false;
    };
  }, [checkUsersEmpty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }
      const data = await res.json();
      login(data);
      navigate("/");
    } catch (err) {
      setError("Network error");
    }
  };

  if (checkingUsers) {
    return <div className="form-container">Checking setup...</div>;
  }
  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            Username:
            <br />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
              autoComplete="username"
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            Password:
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              autoComplete="current-password"
            />
          </label>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button type="submit" className="form-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
