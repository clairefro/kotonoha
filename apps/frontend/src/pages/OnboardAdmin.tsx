import React from "react";
import { useNavigate } from "react-router-dom";
import { sdk } from "../api/sdk";

import SignupForm from "../components/forms/SignupForm";

const OnboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    sdk.users.isEmpty().then((empty) => {
      if (!empty) navigate("/login", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="form-container">
      <h2>Welcome! Set up your first admin account</h2>
      <div className="onboard-admin-note">
        <span>Important:</span> This account will be the only admin to start
        with. Please remember your password—there is no password reset for
        logged out admins!
      </div>
      <SignupForm />
    </div>
  );
};

export default OnboardAdmin;
