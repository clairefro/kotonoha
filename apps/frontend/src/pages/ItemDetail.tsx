import React from "react";
import { useParams, Link } from "react-router-dom";
import { sdk } from "../api/sdk";
import { ItemId } from "shared-types";

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    sdk.items
      .get(id as ItemId)
      .then(setItem)
      .catch(() => setError("Failed to load item."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error || !item) return <div>{error || "Item not found."}</div>;

  return (
    <div>
      <h2>{item.title}</h2>
      <div>
        <strong>Type:</strong> {item.item_type}
      </div>
      {item.source_url && (
        <div>
          <strong>Source:</strong>{" "}
          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
            {item.source_url}
          </a>
        </div>
      )}
      <div>
        <strong>Added by:</strong> {item.added_by}
      </div>
      <div>
        <strong>Created:</strong>{" "}
        {item.created_at && new Date(item.created_at).toLocaleString()}
      </div>
      <Link to="/">Back to items</Link>
    </div>
  );
};

export default ItemDetail;
