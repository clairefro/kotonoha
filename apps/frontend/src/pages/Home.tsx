import { useState, useEffect } from "react";
import { useUsers } from "../contexts/UsersContext";
import AddItemForm from "../components/forms/AddItemForm";
import { sdk } from "../api/sdk";
import Bookshelf from "../components/Bookshelf";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const { refreshUsers } = useUsers();
  useEffect(() => {
    setLoading(true);
    sdk.items
      .list()
      .then((items) => setItems(items))
      .finally(() => setLoading(false));
    refreshUsers();
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
      <h1>Welcome</h1>
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
        <Bookshelf
          items={items}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
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
