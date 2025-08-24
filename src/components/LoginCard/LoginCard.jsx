import LoginForm from "../LoginForm/LoginForm";
import { useNavigate } from "react-router-dom";

export const LoginCard = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission

    // After successful login, navigate to Home

    navigate("/Home");
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
          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
