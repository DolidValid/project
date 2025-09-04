// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { LuFileUp } from "react-icons/lu";
import "bootstrap/dist/css/bootstrap.min.css";

const ImportBatch = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  // ✅ Safe file handler with validation
  const handleFile = (selectedFile) => {
    setError("");
    if (!selectedFile) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      console.log("Submitting file:", file);
      // Upload logic goes here (e.g., API call)
    } else {
      setError("Please select a file before uploading.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Import Batch</h2>

      <form onSubmit={handleSubmit}>
        <div
          className={`border border-primary rounded p-4 text-center mb-3 ${
            isDragActive ? "bg-light" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
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

        <button type="submit" className="btn btn-primary">
          Upload
        </button>
      </form>

      {previewData.length > 0 && (
        <div className="mt-4">
          <h4>Preview</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  {previewData[0].map((headerCell, index) => (
                    <th key={index}>{headerCell || `Column ${index + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1, 6).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
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
