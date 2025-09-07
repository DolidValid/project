import { useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { LuFileUp } from "react-icons/lu";
import "bootstrap/dist/css/bootstrap.min.css";

const ImportBatch = () => {
  const location = useLocation();
  const phoneFromInfoFile = location.state?.phone || ""; // ✅ retrieve phone passed from InfoFile

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  // File handler (same as before)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || previewData.length < 2) {
      setError("Please select a valid file with data before uploading.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessCount(0);

    const headers = previewData[0];
    const rows = previewData.slice(1);

    for (const row of rows) {
      if (!row || row.length === 0) continue;

      const payload = {};
      headers.forEach((header, i) => {
        payload[header] = row[i];
      });

      // ✅ Inject phone from InfoFile as fileId
      payload.fileId = phoneFromInfoFile;

      try {
        const res = await fetch("http://localhost:5000/api/users/active4G", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSuccessCount((prev) => prev + 1);
        } else {
          const errData = await res.json();
          console.error("Insert failed:", errData);
        }
      } catch (err) {
        console.error("API error:", err);
      }
    }

    setUploading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Import Batch</h2>
      <p className="text-muted">
        📱 Using File ID from phone: <strong>{phoneFromInfoFile}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`border border-primary rounded p-4 text-center mb-3 ${
            isDragActive ? "bg-light" : ""
          }`}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragActive(false)}
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

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {successCount > 0 && (
        <div className="alert alert-success mt-3">
          ✅ {successCount} rows inserted successfully!
        </div>
      )}
    </div>
  );
};

export default ImportBatch;
