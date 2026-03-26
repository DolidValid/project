/* eslint-disable react/prop-types */
import InputField from "../Input/InputField";
import PrimaryButton from "../Button/PrimaryButton";

export const LoginForm = ({ onSubmit, loading }) => {
  return (
    <form method="POST" onSubmit={onSubmit}>
      <InputField
        name="Username"
        id="Username"
        placeholder="Username"
        icon="person-fill"
        required
      />

      <InputField
        type="password"
        name="password"
        id="inputPassword"
        placeholder="Password"
        icon="lock-fill"
        required
      />

      <div className="d-grid mt-5">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Connecter"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default LoginForm;
