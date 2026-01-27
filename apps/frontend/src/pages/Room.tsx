import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AddUserForm from "../components/forms/AddUserForm";
import { Link } from "react-router-dom";

interface User {
  id: string;
  username: string;
  is_admin?: boolean;
  created_at?: string;
}

const Room: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = !!user?.is_admin;

  const handleAddUser = async (data: {
    username: string;
    password: string;
  }) => {
    setAddUserLoading(true);
    setAddUserError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add user");
      }
      setShowAddUser(false);
      // Refresh users list
      setLoading(true);
      fetch("/api/users", { credentials: "include" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch users");
          return res.json();
        })
        .then(setUsers)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } catch (err: any) {
      setAddUserError(err.message);
    } finally {
      setAddUserLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/users", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1>Room Members</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Username
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Admin
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.is_admin ? "Yes" : "No"}</td>
                <td>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isAdmin && (
        <div
          style={{
            marginTop: 40,
            padding: 16,
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafbfc",
          }}
        >
          <h2>Manage room</h2>
          <button
            onClick={() => setShowAddUser(true)}
            style={{ marginBottom: 12 }}
          >
            Add user
          </button>
          {showAddUser && (
            <div className="modal-backdrop" style={{ zIndex: 10 }}>
              <div className="modal" style={{ maxWidth: 400 }}>
                <h3>Add User</h3>
                <AddUserForm
                  onSubmit={handleAddUser}
                  loading={addUserLoading}
                  onCancel={() => setShowAddUser(false)}
                />
                {addUserError && (
                  <div style={{ color: "red", marginTop: 8 }}>
                    {addUserError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Room;
