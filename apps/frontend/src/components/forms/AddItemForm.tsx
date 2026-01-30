import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateItemRequestSchema,
  CreateItemRequest,
} from "shared-types/validation/items";
import { TagOrAuthor } from "shared-types";

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
  type AddItemFormValues = Omit<CreateItemRequest, "added_by" | "author"> & {
    added_by?: string;
    tags?: TagOrAuthor[];
    authors?: TagOrAuthor[];
  };
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<TagOrAuthor[]>([]);
  const [authorInput, setAuthorInput] = React.useState("");
  const [authors, setAuthors] = React.useState<TagOrAuthor[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddItemFormValues>({
    resolver: zodResolver(CreateItemRequestSchema) as any,
    defaultValues: {
      title: "",
      source_url: "",
      item_type: "article",
      added_by: addedBy || "",
      tags: [],
      authors: [],
    },
  });

  // Keep form tags in sync
  React.useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);
  React.useEffect(() => {
    setValue("authors", authors);
  }, [authors, setValue]);

  const handleFormSubmit = async (data: AddItemFormValues) => {
    // Always set added_by from prop if provided
    const submitData: CreateItemRequest = {
      ...data,
      added_by: addedBy || data.added_by || "",
    };
    await onSubmit({
      ...submitData,
      tags: data.tags,
      authors: data.authors,
    } as any);
    setTags([]);
    setAuthors([]);
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
      {/* Tags input (chip UI) */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Tags:
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}
          >
            {tags.map((tag, idx) => (
              <span
                key={(tag.id || tag.name) + idx}
                style={{
                  background: "#eee",
                  borderRadius: 12,
                  padding: "2px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 13,
                  marginRight: 4,
                }}
              >
                {tag.name}
                <button
                  type="button"
                  style={{
                    marginLeft: 4,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  aria-label={`Remove tag ${tag.name}`}
                  onClick={() => setTags(tags.filter((t, i) => i !== idx))}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                  e.preventDefault();
                  if (!tags.some((t) => t.name === tagInput.trim())) {
                    setTags([...tags, { name: tagInput.trim(), type: "tag" }]);
                  }
                  setTagInput("");
                }
              }}
              placeholder="Add tag and press Enter"
              style={{
                minWidth: 80,
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              aria-label="Add tag"
            />
          </div>
        </label>
      </div>
      {/* Authors input (chip UI) */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Author(s):
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}
          >
            {authors.map((author, idx) => (
              <span
                key={(author.id || author.name) + idx}
                style={{
                  background: "#e0f7fa",
                  borderRadius: 12,
                  padding: "2px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 13,
                  marginRight: 4,
                }}
              >
                {author.name}
                <button
                  type="button"
                  style={{
                    marginLeft: 4,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  aria-label={`Remove author ${author.name}`}
                  onClick={() =>
                    setAuthors(authors.filter((a, i) => i !== idx))
                  }
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === ",") &&
                  authorInput.trim()
                ) {
                  e.preventDefault();
                  if (!authors.some((a) => a.name === authorInput.trim())) {
                    setAuthors([
                      ...authors,
                      { name: authorInput.trim(), type: "author" },
                    ]);
                  }
                  setAuthorInput("");
                }
              }}
              placeholder="Add author and press Enter"
              style={{
                minWidth: 80,
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              aria-label="Add author"
            />
          </div>
        </label>
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
