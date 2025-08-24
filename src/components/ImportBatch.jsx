// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { LuFileUp } from "react-icons/lu";
import "./ImportBatchStyle.css";

const ImportBatch = () => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setPreviewData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
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
      // Upload logic here
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div className="import-batch-container">
      <h2 className="import-batch-title">Import Batch</h2>

      <form onSubmit={handleSubmit} className="import-batch-form">
        <label
          className={`drop-zone ${isDragActive ? "active" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <LuFileUp className="file-icon" />
          <p>Drag & drop your file here, or click to select</p>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>

        <button type="submit" className="upload-button">
          Upload
        </button>
      </form>

      {previewData.length > 0 && (
        <div className="preview-section">
          <h3 className="preview-title">Preview:</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="preview-table">
              <thead>
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
