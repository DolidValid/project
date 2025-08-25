import { DescriptionSection } from "../components/DescriptionSection/DescriptionSection";

export const Home = () => {
  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div className="row w-100">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4 mx-auto">
          {" "}
          <DescriptionSection />
          <div className="p-3">
            <h3>HELLO !</h3>
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default Home;
