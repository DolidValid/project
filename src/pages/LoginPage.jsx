
import LoginCard from "../components/LoginCard/LoginCard";
import { DescriptionSection } from "../components/DescriptionSection/DescriptionSection";

export const LoginPage = () => {
  return (
    <div className="min-vh-100 bg-white d-flex flex-column">
      <main className="flex-grow-1 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <LoginCard />
            <DescriptionSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
