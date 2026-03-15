import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { LuFileUp } from "react-icons/lu";
import "bootstrap/dist/css/bootstrap.min.css";
import { EXPECTED_HEADERS, fieldMapping } from "../config/importConfig";

const ImportBatch = ({ type, apiUrl, fileId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneFromInfoFile = fileId || location.state?.fileId || "";

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [rowStatuses, setRowStatuses] = useState([]);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        "Invalid file type. Please upload an Excel file (.xlsx or .xls).",
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

        const uploadedHeaders = jsonData[0] || [];
        let requiredHeaders = [];

        switch (type) {
          case "CREATE_CONTRACT":
            requiredHeaders = EXPECTED_HEADERS.CREATE_CONTRACT;
            break;
          case "SET_STATUS":
            requiredHeaders = EXPECTED_HEADERS.SET_STATUS;
            break;
          default:
            requiredHeaders = [];
            break;
        }

        if (requiredHeaders.length > 0) {
          const missingColumns = requiredHeaders.filter(
            (header) => !uploadedHeaders.includes(header),
          );

          if (missingColumns.length > 0) {
            setError(`Missing columns: ${missingColumns.join(", ")}`);
            setPreviewData([]);
            return;
          }
        }

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

  // ✅ Handle upload with header mapping (keep empty values) - BULK UPLOAD VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || previewData.length < 2) {
      setError("Please select a valid file with data before uploading.");
      return;
    }

    if (!phoneFromInfoFile) {
      setError("File ID is missing. Please go back and provide a valid file ID.");
      return;
    }

    if (!type) {
      setError("Batch type is missing. Contact the administrator to fix the screen configuration.");
      return;
    }

    setUploading(true);
    setError("");
    setRowStatuses([]);

    const headers = previewData[0];
    const rows = previewData.slice(1);
    const parsedPayloads = [];

    // Parse all rows locally into one massive array
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const payload = {};
      headers.forEach((header, j) => {
        const apiField = fieldMapping[header] || header;
        payload[apiField] = row[j] !== undefined ? row[j] : "";
      });

      payload.fileId = phoneFromInfoFile;
      parsedPayloads.push(payload);
    }

    // Wrap in Master Payload required by new Backend Unified Route
    const masterPayload = {
      executionDate: new Date().toISOString(), // Fallback if info file date not locally accessible, though info file already logged it. Better: use the one set in infoFile but simplified here
      fileId: phoneFromInfoFile,
      operationType: type,
      data: parsedPayloads
    };

    try {
      const res = await fetch("http://localhost:5000/api/users/upload-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(masterPayload),
      });

      if (res.ok) {
        // Success: Mark all rows as success visually
        const successStatuses = parsedPayloads.map((_, i) => ({ row: i + 1, status: "success" }));
        setRowStatuses(successStatuses);
      } else {
        const errData = await res.json();
        setError(`Upload Failed: ${errData.error || errData.message || "Unknown error"}`);
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    }

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
