import { useState, useEffect, FormEvent } from "react";
import { sdk } from "../api/sdk";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    sdk.items
      .list()
      .then((items) => setItems(items))
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    if (!user) return;
    await sdk.items.create({
      title: newTitle,
      source_url: newSourceUrl,
      item_type: "article",
      added_by: user.id,
    });
    setNewTitle("");
    setNewSourceUrl("");
    setShowModal(false);
    sdk.items
      .list()
      .then((items) => setItems(items))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1>Items</h1>
      <button
        style={{ fontSize: 24, padding: "4px 12px", marginBottom: 16 }}
        onClick={() => setShowModal(true)}
        aria-label="Add new item"
      >
        +
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem}>
              <div style={{ marginBottom: 12 }}>
                <label>
                  Title:
                  <br />
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>
                  Source URL:
                  <br />
                  <input
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
