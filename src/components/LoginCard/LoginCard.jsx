import LoginForm from "../LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const LoginCard = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("Username");
    const password = formData.get("password");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate("/home");
      } else {
        setError(data.message || "Echec de la connexion");
      }
    } catch (err) {
      setError("Le serveur ne répond pas. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-lg-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i
              className="bi bi-life-preserver text-primary"
              style={{ fontSize: "3rem" }}
            ></i>
            <h2 className="mt-3 mb-0">
              Log<span className="text-danger">IN</span>
            </h2>
          </div>
          
          {error && <div className="alert alert-danger text-center mb-4">{error}</div>}
          
          <LoginForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
