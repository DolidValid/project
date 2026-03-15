// eslint-disable-next-line no-unused-vars
import React from "react";
import ImportBatch from "../../components/ImportBatch";

const ActivateServiceParametre = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ImportBatch on the right */}
      <div style={{ flex: 1, padding: "20px" }}>
        <ImportBatch type="ACTIVATE_SERVICE_PARAMETRE" />
      </div>
    </div>
  );
};

export default ActivateServiceParametre;
