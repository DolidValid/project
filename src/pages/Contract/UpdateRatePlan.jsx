import ImportBatch from "../../components/ImportBatch";

const UpdateRatePlan = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ImportBatch on the right */}
      <div style={{ flex: 1, padding: "20px" }}>
        <ImportBatch />
      </div>
    </div>
  );
};

export default UpdateRatePlan;
