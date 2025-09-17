import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { LuFileUp } from "react-icons/lu";
import "bootstrap/dist/css/bootstrap.min.css";

const ImportBatch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneFromInfoFile = location.state?.fileId || "";

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [rowStatuses, setRowStatuses] = useState([]);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ Define mapping Excel header -> backend field
  const fieldMapping = {
    ID: "id",
    MSISDN: "msisdn",
    ACTION: "action",
    SIGN_CONTRACT_3G_DATE: "signContractDate",
    TEMPLATE_NAME: "templateName",
    USER_LOGIN: "userLogin",
    FILE_ID: "fileId",
    NOTIFICATION_MSISDN: "notificationMsisdn",
    NOTIFICATION_TEMPLATE: "notificationTemplate",
    JOB_ID: "jobId",
    PROMO: "promo",
    CO_ID: "coId",
  };

  // ✅ Reset state
  const handleClear = () => {
    setFile(null);
    setPreviewData([]);
    setRowStatuses([]);
    setError("");
  };

  // ✅ Handle file selection and parsing
  const handleFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const maxSize = 2 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      setError(
        "Invalid file type. Please upload an Excel file (.xlsx or .xls)."
      );
      return;
    }
    if (selectedFile.size > maxSize) {
      setError("File is too large. Please upload a file smaller than 2MB.");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames.length) {
          setError("The Excel file is empty or invalid.");
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        setPreviewData(jsonData);
        setRowStatuses([]);
      } catch {
        setError("Error reading Excel file. Please check the file format.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  // ✅ Handle upload with header mapping (keep empty values)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || previewData.length < 2) {
      setError("Please select a valid file with data before uploading.");
      return;
    }

    if (!phoneFromInfoFile) {
      setError(
        "File ID is missing. Please go back and provide a valid file ID."
      );
      return;
    }

    setUploading(true);
    setError("");
    setRowStatuses([]);

    const headers = previewData[0];
    const rows = previewData.slice(1);

    const statuses = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const payload = {};
      headers.forEach((header, j) => {
        const apiField = fieldMapping[header] || header;
        payload[apiField] = row[j] !== undefined ? row[j] : "";
      });

      payload.fileId = phoneFromInfoFile;

      try {
        const res = await fetch("http://localhost:5000/api/users/active4G", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          statuses.push({ row: i + 1, status: "success" });
        } else {
          const errData = await res.json();
          statuses.push({
            row: i + 1,
            status: "error",
            message: errData.error || errData.message || "Insert failed",
          });
        }
      } catch {
        statuses.push({ row: i + 1, status: "error", message: "API error" });
      }
    }

    setRowStatuses(statuses);
    setUploading(false);
  };

  const successCount = rowStatuses.filter((r) => r.status === "success").length;
  const errorCount = rowStatuses.filter((r) => r.status === "error").length;
  const allInserted = rowStatuses.length > 0 && errorCount === 0;

  // ✅ Navigate to Activation Results page with fileId
  const goToResults = () => {
    navigate(`/search?query=${encodeURIComponent(phoneFromInfoFile)}`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Import Batch</h2>
      <p className="text-muted">
        📱 File ID : <strong>{phoneFromInfoFile || "Not provided"}</strong>
      </p>

      {/* ✅ Toolbar with Upload / Clear / View Results + Summary */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={uploading || !phoneFromInfoFile}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={uploading}
          >
            Clear File
          </button>
        </div>

        {/* ✅ Insert Summary */}
        {rowStatuses.length > 0 && (
          <div>
            <span className="badge bg-success me-2">
              ✅ Success: {successCount}
            </span>
            <span className="badge bg-danger">❌ Errors: {errorCount}</span>
          </div>
        )}

        {/* ✅ Only show if all rows inserted */}
        {allInserted && (
          <button
            className="btn btn-success ms-3"
            onClick={goToResults}
            disabled={!phoneFromInfoFile}
          >
            View Activation Results →
          </button>
        )}
      </div>

      {/* ✅ File Drop Area */}
      <form onSubmit={handleSubmit}>
        <div
          className={`border border-primary rounded p-4 text-center mb-3 ${
            isDragActive ? "bg-light" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <LuFileUp size={40} className="text-primary mb-2" />
          <p className="mb-2">
            Drag & drop your Excel file here, or click to select
          </p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="form-control"
          />
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ✅ Preview Table */}
      {previewData.length > 0 && (
        <div className="mt-4">
          <h5>Preview:</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  {previewData[0].map((header, idx) => (
                    <th key={idx}>
                      {header}{" "}
                      {fieldMapping[header] && `→ ${fieldMapping[header]}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1).map((row, i) => (
                  <tr key={i}>
                    {previewData[0].map((_, j) => (
                      <td
                        key={j}
                        className={
                          row[j] === null || row[j] === ""
                            ? "table-warning"
                            : ""
                        }
                      >
                        {row[j] !== undefined ? row[j] : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportBatch;
