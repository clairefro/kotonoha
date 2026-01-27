import React from "react";
import { useNavigate } from "react-router-dom";
import { checkUsersEmpty } from "../api/users";

const OnboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    checkUsersEmpty().then((empty) => {
      if (!empty) navigate("/login", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="onboard-admin-container">
      <h2>Welcome! Set up your first admin account</h2>
      <div className="onboard-admin-note">
        <span>Important:</span> This account will be the only admin to start
        with. Please remember your password—there is no password reset!
      </div>
      <SignupForm />
    </div>
  );
};

function SignupForm() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!username || !password || !confirm) {
      setError("All fields are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create admin user");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setUsername("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="onboard-admin-form">
      <div className="onboard-admin-field">
        <label>
          Username:
          <br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="onboard-admin-input"
            autoFocus
            autoComplete="username"
          />
        </label>
      </div>
      <div className="onboard-admin-field">
        <label>
          Password:
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="onboard-admin-input"
            autoComplete="new-password"
          />
        </label>
      </div>
      <div className="onboard-admin-field">
        <label>
          Confirm Password:
          <br />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="onboard-admin-input"
            autoComplete="new-password"
          />
        </label>
      </div>
      {error && <div className="onboard-admin-error">{error}</div>}
      {success && (
        <div className="onboard-admin-success">
          Admin account created! You can now log in.
        </div>
      )}
      <button type="submit" disabled={loading} className="onboard-admin-button">
        {loading ? "Creating..." : "Create Admin Account"}
      </button>
    </form>
  );
}

export default OnboardAdmin;
