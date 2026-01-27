import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";

const Login: React.FC = () => {
  const { login, checkUsersEmpty } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = React.useState("");
  const [checkingUsers, setCheckingUsers] = React.useState(true);

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

  const onSubmit = async (data: { username: string; password: string }) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const resp = await res.json().catch(() => ({}));
        setServerError(resp.error || resp.message || "Login failed");
        return;
      }
      const resp = await res.json();
      login(resp);
      navigate("/");
    } catch (err) {
      setServerError("Network error");
    }
  };

  if (checkingUsers) {
    return <div className="form-container">Checking setup...</div>;
  }
  return (
    <div className="form-container">
      <h2>Login</h2>
      <LoginForm onSubmit={onSubmit} serverError={serverError} />
    </div>
  );
};

export default Login;
