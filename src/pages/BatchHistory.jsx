import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Spinner, Badge, Button, Card, Container, ProgressBar, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaHistory, FaTrash, FaEye, FaSync, FaPause, FaPlay, FaBan } from "react-icons/fa";

const API_BASE = "/api/users";

const BatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      // Fetch both history and active queue to merge runtime states
      const [historyRes, queueRes] = await Promise.all([
        fetch(`${API_BASE}/batch-history`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE}/batch-queue`, { headers: { "Authorization": `Bearer ${token}` } }).catch(() => null)
      ]);
      
      if (!historyRes.ok) throw new Error("Failed to fetch history");
      const historyData = await historyRes.json();

      // Build a map of runtime states from the queue
      let runtimeMap = {};
      if (queueRes && queueRes.ok) {
        const queueData = await queueRes.json();
        queueData.forEach(q => { runtimeMap[q.fileId] = q.runtimeState; });
      }

      // Enrich history items with runtime state
      const enriched = historyData.map(item => ({
        ...item,
        runtimeState: runtimeMap[item.fileId] || null
      }));

      // Sort by uploadDate descending
      setHistory(enriched.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch from history? This will also delete the associated payload file.")) return;
    
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/batch-history/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to delete batch");
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleBatchAction = async (fileId, action) => {
    const key = `${fileId}-${action}`;
    setActionLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`${API_BASE}/batch-control/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ fileId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Failed to ${action}`);
      // Refresh to get updated states
      await fetchHistory();
    } catch (err) {
      alert(`${action} failed: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchHistory();
    // Auto-refresh every 5 seconds to keep states current
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (etat, runtimeState) => {
    if (runtimeState === 'paused' || etat === 'PAUSED') return { bg: "warning", text: "PAUSED" };
    if (etat === 'IN_PROGRESS') return { bg: "primary", text: "IN PROGRESS" };
    if (etat === 'PENDING') return { bg: "secondary", text: "SCHEDULED" };
    if (etat === 'PROCESSED') return { bg: "success", text: "PROCESSED" };
    if (etat === 'CANCELLED') return { bg: "dark", text: "CANCELLED" };
    if (etat === 'ERROR') return { bg: "danger", text: "ERROR" };
    return { bg: "info", text: etat };
  };

  const isActive = (etat, runtimeState) => {
    return ['IN_PROGRESS', 'PAUSED', 'PENDING'].includes(etat) || runtimeState === 'paused' || runtimeState === 'running';
  };

  const getProgress = (progress) => {
    if (!progress) return null;
    const [current, total] = progress.split('/').map(Number);
    return { current, total, percent: total > 0 ? Math.round((current / total) * 100) : 0 };
  };

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

      {loading && history.length === 0 ? (
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
                    <th>Progress</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th className="text-center" style={{ minWidth: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((item) => {
                      const statusCfg = getStatusBadge(item.etat, item.runtimeState);
                      const active = isActive(item.etat, item.runtimeState);
                      const isRunning = item.etat === 'IN_PROGRESS' && item.runtimeState !== 'paused';
                      const isPaused = item.runtimeState === 'paused' || item.etat === 'PAUSED';
                      const isPending = item.etat === 'PENDING';
                      const progress = getProgress(item.progress);

                      return (
                        <tr key={item.id} className={`align-middle ${active ? 'table-active-row' : ''}`}>
                          <td className="ps-4 fw-bold text-secondary">{item.fileId}</td>
                          <td>
                            <Badge bg="info" className="text-dark">
                              {item.operationType || "N/A"}
                            </Badge>
                          </td>
                          <td>{item.recordNumber}</td>
                          <td style={{ minWidth: 140 }}>
                            {progress ? (
                              <div>
                                <div className="d-flex justify-content-between" style={{ fontSize: '0.72rem' }}>
                                  <span>{progress.current}/{progress.total}</span>
                                  <span className="fw-bold">{progress.percent}%</span>
                                </div>
                                <ProgressBar
                                  now={progress.percent}
                                  animated={isRunning}
                                  striped={isPaused}
                                  variant={isPaused ? "warning" : item.etat === 'PROCESSED' ? "success" : "danger"}
                                  style={{ height: 6, borderRadius: 10 }}
                                />
                              </div>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td className="text-muted small">
                            {new Date(item.uploadDate).toLocaleString()}
                          </td>
                          <td>
                            <Badge bg={statusCfg.bg} style={{ fontSize: '0.72rem', padding: '5px 10px', borderRadius: 6 }}>
                              {active && <span className="me-1" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff', animation: isRunning ? 'pulse 1s infinite' : 'none' }}></span>}
                              {statusCfg.text}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-1 flex-wrap">
                              {/* Pause button - only for running batches */}
                              {isRunning && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Pause</Tooltip>}>
                                  <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => handleBatchAction(item.fileId, 'pause')}
                                    disabled={actionLoading[`${item.fileId}-pause`]}
                                    style={{ borderRadius: 6, minWidth: 34 }}
                                  >
                                    {actionLoading[`${item.fileId}-pause`] ? <Spinner size="sm" /> : <FaPause size={11} />}
                                  </Button>
                                </OverlayTrigger>
                              )}

                              {/* Resume button - only for paused batches */}
                              {isPaused && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Resume</Tooltip>}>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleBatchAction(item.fileId, 'resume')}
                                    disabled={actionLoading[`${item.fileId}-resume`]}
                                    style={{ borderRadius: 6, minWidth: 34 }}
                                  >
                                    {actionLoading[`${item.fileId}-resume`] ? <Spinner size="sm" /> : <FaPlay size={11} />}
                                  </Button>
                                </OverlayTrigger>
                              )}

                              {/* Cancel button - for any active batch */}
                              {active && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Cancel</Tooltip>}>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm(`Cancel batch ${item.fileId}?`)) {
                                        handleBatchAction(item.fileId, 'cancel');
                                      }
                                    }}
                                    disabled={actionLoading[`${item.fileId}-cancel`]}
                                    style={{ borderRadius: 6, minWidth: 34 }}
                                  >
                                    {actionLoading[`${item.fileId}-cancel`] ? <Spinner size="sm" /> : <FaBan size={11} />}
                                  </Button>
                                </OverlayTrigger>
                              )}

                              {/* View Results */}
                              <OverlayTrigger placement="top" overlay={<Tooltip>View Results</Tooltip>}>
                                <Button 
                                  variant="light" 
                                  size="sm" 
                                  className="text-primary"
                                  onClick={() => navigate(`/batch-results/${item.fileId}`)}
                                  style={{ borderRadius: 6, minWidth: 34 }}
                                >
                                  <FaEye size={13} />
                                </Button>
                              </OverlayTrigger>

                              {/* Delete - only for completed/cancelled/errored */}
                              {!active && (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                                  <Button 
                                    variant="light" 
                                    size="sm" 
                                    className="text-danger"
                                    onClick={() => handleDelete(item.id)}
                                    style={{ borderRadius: 6, minWidth: 34 }}
                                  >
                                    <FaTrash size={12} />
                                  </Button>
                                </OverlayTrigger>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .table thead th { border-top: none; padding: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .table tbody td { padding: 1rem; }
        .table-active-row { background-color: rgba(237, 28, 36, 0.03) !important; }
        .table-active-row:hover { background-color: rgba(237, 28, 36, 0.06) !important; }
      `}</style>
    </Container>
  );
};

export default BatchHistory;
