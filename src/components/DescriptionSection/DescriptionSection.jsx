import React from "react";
import oo from "../../assets/img/oo.png";

export const DescriptionSection = () => {
  return (
    <div className="col-lg-5 mb-5 mb-lg-0">
      <div className="text-center mt-4">
        <img
          src={oo}
          alt="Fire Extinguisher"
          className="img-fluid"
          style={{ maxHeight: "300px" }}
        />
      </div>
    </div>
  );
};
