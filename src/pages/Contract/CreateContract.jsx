import InfoFile from "../InfoFile";

const CreateContract = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ImportBatch on the right */}
      <div style={{ flex: 1, padding: "20px" }}>
        <InfoFile />
      </div>
    </div>
  );
};

export default CreateContract;
