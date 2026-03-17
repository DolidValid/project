import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import RedButton from "../components/Button/PrimaryButton";

const InfoFile = ({ onSuccess, prefix = "Set3GProfile_" }) => {
  const [executionDate, setExecutionDate] = useState("");
  const [lineCount, setLineCount] = useState("");
  const [fileId, setFileId] = useState(""); // auto-generated
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper: format date to ddMMyyyy_hhmmss
  const formatDateForId = useCallback((date) => {
    const pad = (n) => n.toString().padStart(2, "0");

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}${month}${year}_${hours}${minutes}${seconds}`;
  }, []);

  // Regenerate File ID whenever executionDate changes
  useEffect(() => {
    // Get the current system date and time
    const currentDate = new Date();

    // Construct the fileId using the current date
    setFileId(`${prefix}${formatDateForId(currentDate)}`);

    // The dependency array is now empty because we don't depend on external props
  }, [formatDateForId, prefix]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formatForOracle = (dateStr) => {
      const d = new Date(dateStr);
      const pad = (n) => n.toString().padStart(2, "0");
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    try {
      const formattedDate = formatForOracle(executionDate);

      // ✅ Pass fileId and executionDate to ImportBatch via prop or navigation
      if (onSuccess) {
        onSuccess(fileId, formattedDate);
      } else {
        navigate("/ImportBatch", { state: { fileId, executionDate: formattedDate } });
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div className="row w-100">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4 mx-auto">
          <div className="p-4 border rounded shadow bg-light">
            <form onSubmit={handleSubmit}>
              {/* Date et heure d’exécution */}
              <div className="mb-3">
                <label htmlFor="executionDate" className="form-label">
                  Date et heure d’exécution
                </label>
                <input
                  id="executionDate"
                  type="datetime-local"
                  className="form-control"
                  value={executionDate}
                  onChange={(e) => setExecutionDate(e.target.value)}
                  required
                />
              </div>

              {/* Nombre de lignes */}
              <div className="mb-3">
                <label htmlFor="lineCount" className="form-label">
                  Nombre de lignes
                </label>
                <input
                  id="lineCount"
                  type="number"
                  className="form-control"
                  value={lineCount}
                  onChange={(e) => setLineCount(e.target.value)}
                  required
                />
              </div>

              {/* Auto-generated File ID */}
              <div className="mb-3">
                <label htmlFor="fileId" className="form-label">
                  File ID
                </label>
                <input
                  id="fileId"
                  type="text"
                  className="form-control"
                  value={fileId}
                  readOnly
                />
              </div>

              <RedButton
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </RedButton>
            </form>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

InfoFile.propTypes = {
  onSuccess: PropTypes.func,
  prefix: PropTypes.string,
};

export default InfoFile;
