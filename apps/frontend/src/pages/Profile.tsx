import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { sdk } from "../api/sdk";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [fullUser, setFullUser] = React.useState<typeof user | null>(user);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!user) return;
    sdk.users
      .get(user.id)
      .then(setFullUser)
      .catch(() => setError("Failed to load user info."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="form-container">
        <h2>Profile</h2>
        <div className="form-error">
          You must be logged in to view your profile.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="form-container">
        <h2>Your Profile</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !fullUser) {
    return (
      <div className="form-container">
        <h2>Your Profile</h2>
        <div className="form-error">{error || "User not found."}</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Your Profile</h2>
      <div className="profile-info">
        <div>
          <strong>Username:</strong> {fullUser.username}
        </div>
        <div>
          <strong>User ID:</strong> {fullUser.id}
        </div>
        {fullUser.is_admin === true && (
          <div>
            <strong>Is Admin:</strong> Yes
          </div>
        )}
        {fullUser.created_at && (
          <div>
            <strong>Joined:</strong>{" "}
            {new Date(fullUser.created_at).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
