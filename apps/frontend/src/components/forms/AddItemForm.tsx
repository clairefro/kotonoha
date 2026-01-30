import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateItemRequestSchema,
  CreateItemRequest,
} from "shared-types/validation/items";
import { TagOrAuthor } from "shared-types";
import { tags as tagsSdk } from "../../api/sdk/tags";

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
  const [tagSuggestions, setTagSuggestions] = React.useState<TagOrAuthor[]>([]);
  const [tagSuggestionIndex, setTagSuggestionIndex] =
    React.useState<number>(-1);
  const [authorSuggestions, setAuthorSuggestions] = React.useState<
    TagOrAuthor[]
  >([]);
  const [authorSuggestionIndex, setAuthorSuggestionIndex] =
    React.useState<number>(-1);
  const [allTags, setAllTags] = React.useState<TagOrAuthor[] | null>(null);
  const [suggestedTags, setSuggestedTags] = React.useState<TagOrAuthor[]>([]);
  const [suggestedAuthors, setSuggestedAuthors] = React.useState<TagOrAuthor[]>(
    [],
  );

  // Fetch all tags/authors once on mount
  // DRY utility for adding a tag pill
  function addTagPill(suggestion?: TagOrAuthor, freeform?: string) {
    if (suggestion && !tags.some((t) => t.name === suggestion.name)) {
      setTags([...tags, suggestion]);
    } else if (freeform && !tags.some((t) => t.name === freeform.trim())) {
      setTags([...tags, { name: freeform.trim(), type: "tag" }]);
    }
    setTagInput("");
    setTagSuggestionIndex(-1);
    setTagSuggestions([]);
  }

  // DRY utility for adding an author pill
  function addAuthorPill(suggestion?: TagOrAuthor, freeform?: string) {
    if (suggestion && !authors.some((a) => a.name === suggestion.name)) {
      setAuthors([...authors, suggestion]);
    } else if (freeform && !authors.some((a) => a.name === freeform.trim())) {
      setAuthors([...authors, { name: freeform.trim(), type: "author" }]);
    }
    setAuthorInput("");
    setAuthorSuggestionIndex(-1);
    setAuthorSuggestions([]);
  }

  React.useEffect(() => {
    let ignore = false;
    tagsSdk.list().then((data) => {
      if (!ignore) {
        setAllTags(data);
        // Split tags into topics and humans
        const tagsOnly = data.filter((t) => t.id && t.id.startsWith("t_"));
        const authorsOnly = data.filter((t) => t.id && t.id.startsWith("h_"));
        setSuggestedTags(tagsOnly);
        setSuggestedAuthors(authorsOnly);

        if (tagsOnly.length === 0) {
          console.warn(
            "No suggestedTags found! Check tag type/id logic.",
            data,
          );
        }
        if (authorsOnly.length === 0) {
          console.warn(
            "No suggestedAuthors found! Check author type/id logic.",
            data,
          );
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Autofill for tags (client-side filter)
  React.useEffect(() => {
    if (!suggestedTags) return;
    if (tagInput.trim()) {
      const input = tagInput.trim().toLowerCase();
      const filtered = suggestedTags.filter((t) => {
        const hasName = !!t.name;
        const nameLower = t.name ? t.name.toLowerCase() : "";
        const matches = nameLower.includes(input);
        const alreadyAdded = tags.some((tag) => tag.name === t.name);

        return hasName && matches && !alreadyAdded;
      });
      setTagSuggestions(filtered);
      setTagSuggestionIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setTagSuggestions([]);
      setTagSuggestionIndex(-1);
    }
  }, [tagInput, tags, suggestedTags]);

  // Autofill for authors (client-side filter)
  React.useEffect(() => {
    if (!suggestedAuthors) return;
    if (authorInput.trim()) {
      const input = authorInput.trim().toLowerCase();
      const filtered = suggestedAuthors.filter((t) => {
        const hasName = !!t.name;
        const nameLower = t.name ? t.name.toLowerCase() : "";
        const matches = nameLower.includes(input);
        const alreadyAdded = authors.some((a) => a.name === t.name);

        return hasName && matches && !alreadyAdded;
      });

      setAuthorSuggestions(filtered);
      setAuthorSuggestionIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setAuthorSuggestions([]);
      setAuthorSuggestionIndex(-1);
    }
  }, [authorInput, authors, suggestedAuthors]);

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
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                    e.preventDefault();
                    if (
                      typeof tagSuggestionIndex === "number" &&
                      tagSuggestionIndex >= 0 &&
                      tagSuggestions.length > 0 &&
                      e.key === "Enter"
                    ) {
                      addTagPill(tagSuggestions[tagSuggestionIndex]);
                    } else {
                      addTagPill(undefined, tagInput);
                    }
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setTagSuggestionIndex((prev) =>
                      tagSuggestions.length === 0
                        ? -1
                        : prev < tagSuggestions.length - 1
                          ? prev + 1
                          : 0,
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setTagSuggestionIndex((prev) =>
                      tagSuggestions.length === 0
                        ? -1
                        : prev > 0
                          ? prev - 1
                          : tagSuggestions.length - 1,
                    );
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
                autoComplete="off"
              />
              {tagSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    border: "2px solid #1976d2",
                    zIndex: 9999,
                    minWidth: 160,
                    boxShadow: "0 8px 32px rgba(25, 118, 210, 0.18)",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {tagSuggestions.map((suggestion, idx) => (
                    <div
                      key={suggestion.id || suggestion.name}
                      style={{
                        padding: 10,
                        cursor: "pointer",
                        fontSize: 15,
                        background:
                          idx === tagSuggestionIndex ? "#e3f2fd" : "#fff",
                      }}
                      onMouseEnter={() => setTagSuggestionIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addTagPill(suggestion);
                      }}
                    >
                      {suggestion.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <div style={{ position: "relative" }}>
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
                    if (
                      typeof authorSuggestionIndex === "number" &&
                      authorSuggestionIndex >= 0 &&
                      authorSuggestions.length > 0 &&
                      e.key === "Enter"
                    ) {
                      addAuthorPill(authorSuggestions[authorSuggestionIndex]);
                    } else {
                      addAuthorPill(undefined, authorInput);
                    }
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setAuthorSuggestionIndex((prev) =>
                      authorSuggestions.length === 0
                        ? -1
                        : prev < authorSuggestions.length - 1
                          ? prev + 1
                          : 0,
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setAuthorSuggestionIndex((prev) =>
                      authorSuggestions.length === 0
                        ? -1
                        : prev > 0
                          ? prev - 1
                          : authorSuggestions.length - 1,
                    );
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
                autoComplete="off"
              />
              {authorSuggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    border: "2px solid #1976d2",
                    zIndex: 9999,
                    minWidth: 160,
                    boxShadow: "0 8px 32px rgba(25, 118, 210, 0.18)",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {authorSuggestions.map((suggestion, idx) => (
                    <div
                      key={suggestion.id || suggestion.name}
                      style={{
                        padding: 10,
                        cursor: "pointer",
                        fontSize: 15,
                        background:
                          idx === authorSuggestionIndex ? "#e3f2fd" : "#fff",
                      }}
                      onMouseEnter={() => setAuthorSuggestionIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addAuthorPill(suggestion);
                      }}
                    >
                      {suggestion.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
