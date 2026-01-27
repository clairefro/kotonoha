import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserRequestSchema } from "shared-types/validation/auth";

type SignupFormFields = {
  username: string;
  password: string;
  confirm: string; // frontend only
};

const SignupForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    // setError,
    reset,
  } = useForm<SignupFormFields>({
    resolver: zodResolver(CreateUserRequestSchema) as any, // bypass confirm,
  });
  const password = watch("password");

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const onSubmit = async (data: any) => {
    setServerError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const resp = await res.json().catch(() => ({}));
        setServerError(
          resp.error || resp.message || "Failed to create admin user",
        );
        setLoading(false);
        return;
      }
      const resp = await res.json();
      login({ id: resp.id, username: resp.username });
      setSuccess(true);
      reset();
    } catch (err) {
      setServerError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="onboard-admin-form">
      <div className="form-field">
        <label>
          Username:
          <br />
          <input
            {...register("username")}
            className="form-input"
            autoFocus
            autoComplete="username"
          />
        </label>
        {errors.username && (
          <div className="form-error">{errors.username.message as string}</div>
        )}
      </div>
      <div className="form-field">
        <label>
          Password:
          <br />
          <input
            type="password"
            {...register("password")}
            className="form-input"
            autoComplete="new-password"
          />
        </label>
        {errors.password && (
          <div className="form-error">{errors.password.message as string}</div>
        )}
      </div>
      <div className="form-field">
        <label>
          Confirm Password:
          <br />
          <input
            type="password"
            {...register("confirm", {
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            className="form-input"
            autoComplete="new-password"
          />
        </label>
        {errors.confirm && (
          <div className="form-error">{errors.confirm.message as string}</div>
        )}
      </div>
      {serverError && <div className="form-error">{serverError}</div>}
      {success && (
        <div className="form-success">Admin account created! Logging in...</div>
      )}
      <button type="submit" disabled={loading} className="form-button">
        {loading ? "Creating..." : "Create Admin Account"}
      </button>
    </form>
  );
};

export default SignupForm;
