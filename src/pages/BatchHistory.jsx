import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Spinner, Badge, Button, Card, Container } from "react-bootstrap";
import { FaHistory, FaTrash, FaEye, FaSync } from "react-icons/fa";

const BatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/users/batch-history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      // Sort by uploadDate descending
      setHistory(data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch from history? This will also delete the associated payload file.")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/batch-history/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete batch");
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark d-flex align-items-center">
          <FaHistory className="me-2 text-danger" /> Batch Execution History
        </h2>
        <Button variant="outline-danger" onClick={fetchHistory} disabled={loading}>
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </Button>
      </div>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Loading history...</p>
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">File ID</th>
                    <th>Operation</th>
                    <th>Records</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="align-middle">
                        <td className="ps-4 fw-bold text-secondary">{item.fileId}</td>
                        <td>
                          <Badge bg="info" className="text-dark">
                            {item.operationType || "N/A"}
                          </Badge>
                        </td>
                        <td>{item.recordNumber}</td>
                        <td className="text-muted small">
                          {new Date(item.uploadDate).toLocaleString()}
                        </td>
                        <td>
                          <Badge bg={item.etat === "PROCESSED" ? "success" : "warning"}>
                            {item.etat}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="me-2 text-primary"
                            onClick={() => navigate(`/batch-results/${item.fileId}`)}
                            title="View Results"
                          >
                            <FaEye />
                          </Button>
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="text-danger"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <p className="text-muted mb-0">No history found for the last month.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .table thead th { border-top: none; padding: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .table tbody td { padding: 1rem; }
      `}</style>
    </Container>
  );
};

export default BatchHistory;
