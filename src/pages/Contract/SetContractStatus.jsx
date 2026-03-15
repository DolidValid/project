// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import InfoFile from "../InfoFile";
import ImportBatch from "../../components/ImportBatch";

const SetContractStatus = () => {
  const [step, setStep] = useState(0);
  const [fileId, setFileId] = useState("");

  const handleInfoSuccess = (generatedId) => {
    setFileId(generatedId);
    setStep(2);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Step Wizard Container */}
      <div style={{ flex: 1, padding: "20px" }}>
        {step === 0 && (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "80%" }}>
            <h2 className="mb-4">Set Contract Status</h2>
            <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>
              Start New Batch
            </button>
          </div>
        )}
        {step === 1 && <InfoFile onSuccess={handleInfoSuccess} />}
        {step === 2 && (
          <ImportBatch
            type="SET_STATUS"
            apiUrl="http://localhost:5000/api/contracts/status"
            fileId={fileId}
          />
        )}
      </div>
    </div>
  );
};

export default SetContractStatus;
