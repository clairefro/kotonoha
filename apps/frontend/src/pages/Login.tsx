import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      login(data.user);
      navigate("/");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-field">
          <label>
            Username:
            <br />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="login-input"
              autoComplete="username"
            />
          </label>
        </div>
        <div className="login-field">
          <label>
            Password:
            <br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              autoComplete="current-password"
            />
          </label>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
