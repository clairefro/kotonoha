import React, { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  source_url?: string;
  item_type?: string;
  added_by?: string;
  created_at?: string;
};

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        title: newTitle,
        source_url: newSourceUrl,
        item_type: "article",
        added_by: "u_admin_1", // or current user
      }),
    });
    setNewTitle("");
    setNewSourceUrl("");
    setShowModal(false);
    // Refresh items
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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

export default App;
