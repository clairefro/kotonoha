import { useState, useEffect } from "react";
import AddItemForm from "../components/forms/AddItemForm";
import { sdk } from "../api/sdk";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    sdk.items
      .list()
      .then((items) => setItems(items))
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = async (data: any) => {
    if (!user) return;
    setLoading(true);
    await sdk.items.create({
      ...data,
      added_by: user.id,
    });
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
            <li key={item.id}>
              <a href={`/items/${item.id}`}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Item</h2>
            <AddItemForm
              onSubmit={handleAddItem}
              loading={loading}
              onCancel={() => setShowModal(false)}
              addedBy={user?.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
