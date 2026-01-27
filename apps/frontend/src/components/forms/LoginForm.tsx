import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestSchema } from "shared-types/validation/auth";

export interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  serverError?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, serverError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{
    username: string;
    password: string;
  }>({
    resolver: zodResolver(LoginRequestSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-field">
        <label>
          Username:
          <br />
          <input
            {...register("username")}
            className="form-input"
            autoComplete="username"
            autoFocus
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
            autoComplete="current-password"
          />
        </label>
        {errors.password && (
          <div className="form-error">{errors.password.message as string}</div>
        )}
      </div>
      {serverError && <div className="form-error">{serverError}</div>}
      <button type="submit" className="form-button">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
