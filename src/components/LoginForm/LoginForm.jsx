/* eslint-disable react/prop-types */
import InputField from "../Input/InputField";
import PrimaryButton from "../Button/PrimaryButton";

export const LoginForm = ({ onSubmit }) => {
  return (
    <form method="POST" onSubmit={onSubmit}>
      <InputField
        name="Username"
        id="Username"
        placeholder="Username"
        icon="person-fill"
      />

      <InputField
        type="password"
        name="password"
        id="inputPassword"
        placeholder="Password"
        icon="lock-fill"
      />

      <div className="d-grid mt-5">
        <PrimaryButton type="submit">Connecter</PrimaryButton>
      </div>
    </form>
  );
};

export default LoginForm;
