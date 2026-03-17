import { useState } from "react";
import InfoFile from "../InfoFile";
import ImportBatch from "../../components/ImportBatch";

const CreateContract = () => {
  const [step, setStep] = useState(0);
  const [fileId, setFileId] = useState("");
  const [executionDate, setExecutionDate] = useState("");

  const handleInfoSuccess = (generatedId, exeDate) => {
    setFileId(generatedId);
    setExecutionDate(exeDate);
    setStep(2);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Step Wizard Container */}
      <div style={{ flex: 1, padding: "20px" }}>
        {step === 0 && (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80%" }}>
            <h2 className="mb-4">Create Contract</h2>
            <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>
              Start New Batch
            </button>
          </div>
        )}
        {step === 1 && <InfoFile onSuccess={handleInfoSuccess} prefix="SetContractAndServices_" />}
        {step === 2 && (
          <ImportBatch
            type="CREATE_CONTRACT"
            fileId={fileId}
            executionDate={executionDate}
          />
        )}
      </div>
    </div>
  );
};

export default CreateContract;
