import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateItemRequestSchema,
  CreateItemRequest,
} from "shared-types/validation/items";

interface AddItemFormProps {
  onSubmit: (data: CreateItemRequest) => void | Promise<void>;
  loading?: boolean;
  onCancel: () => void;
  addedBy?: string; // user id
}

const AddItemForm: React.FC<AddItemFormProps> = ({
  onSubmit,
  loading,
  onCancel,
  addedBy,
}) => {
  type AddItemFormValues = Omit<CreateItemRequest, "added_by"> & {
    added_by?: string;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddItemFormValues>({
    resolver: zodResolver(CreateItemRequestSchema) as any,
    defaultValues: {
      title: "",
      source_url: "",
      item_type: "article",
      added_by: addedBy || "",
    },
  });

  const handleFormSubmit = async (data: AddItemFormValues) => {
    // Always set added_by from prop if provided
    const submitData: CreateItemRequest = {
      ...data,
      added_by: addedBy || data.added_by || "",
    };
    await onSubmit(submitData);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div style={{ marginBottom: 12 }}>
        <label>
          Title:
          <br />
          <input
            {...register("title")}
            required
            style={{ width: "100%" }}
            autoFocus
          />
        </label>
        {errors.title && (
          <div style={{ color: "red" }}>{errors.title.message}</div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Source URL:
          <br />
          <input {...register("source_url")} style={{ width: "100%" }} />
        </label>
        {errors.source_url && (
          <div style={{ color: "red" }}>{errors.source_url.message}</div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          Item Type:
          <br />
          <select {...register("item_type")} style={{ width: "100%" }}>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="essay">Essay</option>
            <option value="poem">Poem</option>
            <option value="other">Other</option>
          </select>
        </label>
        {errors.item_type && (
          <div style={{ color: "red" }}>{errors.item_type.message}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading}>
          Add
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddItemForm;
