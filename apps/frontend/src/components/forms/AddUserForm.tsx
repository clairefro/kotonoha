import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserCreateRequestSchema,
  UserCreateRequest,
} from "shared-types/validation/users";

interface AddUserFormProps {
  onSubmit: (data: UserCreateRequest) => void | Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  onSubmit,
  loading,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserCreateRequest>({
    resolver: zodResolver(UserCreateRequestSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleFormSubmit = async (data: UserCreateRequest) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div style={{ marginBottom: 12 }}>
        <label>
          Username:
          <br />
          <input
            {...register("username")}
            required
            style={{ width: "100%" }}
            autoFocus
          />
        </label>
        {errors.username && (
          <div style={{ color: "red" }}>{errors.username.message}</div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Password:
          <br />
          <input
            type="password"
            {...register("password")}
            required
            style={{ width: "100%" }}
          />
        </label>
        {errors.password && (
          <div style={{ color: "red" }}>{errors.password.message}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading}>
          Add User
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;
