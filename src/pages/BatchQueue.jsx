import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Spinner, Badge, Button, Card, Container, ProgressBar, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { FaListAlt, FaSync, FaPause, FaPlay, FaBan, FaEye, FaClock, FaRocket, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api/users";

const BatchQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [confirmModal, setConfirmModal] = useState({ show: false, fileId: null, action: null });
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/batch-queue`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to fetch queue");
      const data = await res.json();
      setQueue(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 3 seconds
    intervalRef.current = setInterval(fetchQueue, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleAction = async (fileId, action) => {
    setActionLoading(prev => ({ ...prev, [`${fileId}-${action}`]: true }));
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
      await fetchQueue();
    } catch (err) {
      alert(`${action} failed: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${fileId}-${action}`]: false }));
      setConfirmModal({ show: false, fileId: null, action: null });
    }
  };

  const confirmAction = (fileId, action) => {
    setConfirmModal({ show: true, fileId, action });
  };

  const getStatusConfig = (etat, runtimeState) => {
    if (runtimeState === 'paused' || etat === 'PAUSED') {
      return { bg: "warning", text: "PAUSED", icon: <FaPause className="me-1" /> };
    }
    if (etat === 'IN_PROGRESS') {
      return { bg: "primary", text: "RUNNING", icon: <FaRocket className="me-1" /> };
    }
    if (etat === 'PENDING') {
      return { bg: "secondary", text: "SCHEDULED", icon: <FaClock className="me-1" /> };
    }
    return { bg: "info", text: etat, icon: null };
  };

  const getProgress = (progress) => {
    if (!progress) return { current: 0, total: 0, percent: 0 };
    const [current, total] = progress.split('/').map(Number);
    return { current, total, percent: total > 0 ? Math.round((current / total) * 100) : 0 };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    if (dateStr.includes('/')) {
      const [datePart, timePart] = dateStr.split(' ');
      return `${datePart} ${timePart || ''}`;
    }
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark d-flex align-items-center" style={{ gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #ed1c24 0%, #c71c1c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(237,28,36,0.3)'
          }}>
            <FaListAlt color="#fff" size={20} />
          </div>
          Batch Queue
          {queue.length > 0 && (
            <Badge bg="danger" pill className="ms-2" style={{ fontSize: '0.75rem' }}>
              {queue.length} active
            </Badge>
          )}
        </h2>
        <Button
          variant="outline-danger"
          onClick={() => { setLoading(true); fetchQueue(); }}
          disabled={loading}
          className="d-flex align-items-center gap-2"
          style={{ borderRadius: 10, fontWeight: 600 }}
        >
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </Button>
      </div>

      {error && <div className="alert alert-danger shadow-sm d-flex align-items-center gap-2"><FaExclamationTriangle /> {error}</div>}

      {loading && queue.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Loading batch queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <Card className="shadow-sm border-0 text-center py-5" style={{ borderRadius: 16 }}>
          <Card.Body>
            <div style={{ fontSize: 64, opacity: 0.2 }}>📭</div>
            <h4 className="text-muted mt-3">No Active Batches</h4>
            <p className="text-muted">All batches have been processed. New scheduled batches will appear here.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="row g-3">
          {queue.map((batch) => {
            const status = getStatusConfig(batch.etat, batch.runtimeState);
            const progress = getProgress(batch.progress);
            const isRunning = batch.etat === 'IN_PROGRESS' && batch.runtimeState !== 'paused';
            const isPaused = batch.runtimeState === 'paused' || batch.etat === 'PAUSED';
            const isPending = batch.etat === 'PENDING';

            return (
              <div key={batch.id} className="col-12">
                <Card className="shadow-sm border-0 batch-queue-card" style={{ borderRadius: 14, overflow: 'hidden', borderLeft: `4px solid ${isPaused ? '#ffc107' : isRunning ? '#ed1c24' : '#6c757d'}` }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                      {/* Left: Info */}
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h5 className="mb-0 fw-bold" style={{ color: '#1a1a2e', letterSpacing: '-0.3px' }}>{batch.fileId}</h5>
                          <Badge bg={status.bg} className="d-flex align-items-center" style={{ fontSize: '0.72rem', padding: '5px 10px', borderRadius: 8 }}>
                            {status.icon} {status.text}
                          </Badge>
                        </div>

                        <div className="d-flex flex-wrap gap-3 mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          <span><strong>Operation:</strong> <Badge bg="dark" style={{ fontSize: '0.72rem' }}>{batch.operationType}</Badge></span>
                          <span><strong>Records:</strong> {batch.recordNumber}</span>
                          <span><strong>Scheduled:</strong> {formatDate(batch.executionDate)}</span>
                          <span><strong>Uploaded:</strong> {formatDate(batch.uploadDate)}</span>
                        </div>

                        {/* Progress bar for non-pending */}
                        {!isPending && batch.progress && (
                          <div className="mt-3">
                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.78rem' }}>
                              <span className="text-muted">Progress</span>
                              <span className="fw-bold" style={{ color: '#ed1c24' }}>
                                {progress.current} / {progress.total} ({progress.percent}%)
                              </span>
                            </div>
                            <ProgressBar
                              now={progress.percent}
                              animated={isRunning}
                              striped={isPaused}
                              variant={isPaused ? "warning" : "danger"}
                              style={{ height: 8, borderRadius: 10 }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end" style={{ minWidth: 200 }}>
                        {/* Pause - only when running */}
                        {isRunning && (
                          <OverlayTrigger placement="top" overlay={<Tooltip>Pause Execution</Tooltip>}>
                            <Button
                              variant="warning"
                              size="sm"
                              className="d-flex align-items-center gap-1 fw-bold"
                              onClick={() => handleAction(batch.fileId, 'pause')}
                              disabled={actionLoading[`${batch.fileId}-pause`]}
                              style={{ borderRadius: 8, padding: '6px 14px' }}
                            >
                              {actionLoading[`${batch.fileId}-pause`] ? <Spinner size="sm" /> : <FaPause />}
                              Pause
                            </Button>
                          </OverlayTrigger>
                        )}

                        {/* Resume - only when paused */}
                        {isPaused && (
                          <OverlayTrigger placement="top" overlay={<Tooltip>Resume Execution</Tooltip>}>
                            <Button
                              variant="success"
                              size="sm"
                              className="d-flex align-items-center gap-1 fw-bold"
                              onClick={() => handleAction(batch.fileId, 'resume')}
                              disabled={actionLoading[`${batch.fileId}-resume`]}
                              style={{ borderRadius: 8, padding: '6px 14px' }}
                            >
                              {actionLoading[`${batch.fileId}-resume`] ? <Spinner size="sm" /> : <FaPlay />}
                              Resume
                            </Button>
                          </OverlayTrigger>
                        )}

                        {/* Cancel - any active state */}
                        <OverlayTrigger placement="top" overlay={<Tooltip>Cancel Batch</Tooltip>}>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center gap-1 fw-bold"
                            onClick={() => confirmAction(batch.fileId, 'cancel')}
                            disabled={actionLoading[`${batch.fileId}-cancel`]}
                            style={{ borderRadius: 8, padding: '6px 14px' }}
                          >
                            {actionLoading[`${batch.fileId}-cancel`] ? <Spinner size="sm" /> : <FaBan />}
                            Cancel
                          </Button>
                        </OverlayTrigger>

                        {/* View Results */}
                        {!isPending && (
                          <OverlayTrigger placement="top" overlay={<Tooltip>View Results</Tooltip>}>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="d-flex align-items-center gap-1"
                              onClick={() => navigate(`/batch-results/${batch.fileId}`)}
                              style={{ borderRadius: 8, padding: '6px 14px' }}
                            >
                              <FaEye /> View
                            </Button>
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal({ show: false, fileId: null, action: null })} centered>
        <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaExclamationTriangle className="text-danger" /> Confirm Cancel
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">Are you sure you want to <strong className="text-danger">cancel</strong> this batch?</p>
          <p className="text-muted small mb-0">
            <strong>File ID:</strong> {confirmModal.fileId}
          </p>
          <p className="text-muted small">This action cannot be undone. Records already processed will remain.</p>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button variant="light" onClick={() => setConfirmModal({ show: false, fileId: null, action: null })} style={{ borderRadius: 8 }}>
            Keep Running
          </Button>
          <Button
            variant="danger"
            onClick={() => handleAction(confirmModal.fileId, 'cancel')}
            disabled={actionLoading[`${confirmModal.fileId}-cancel`]}
            className="d-flex align-items-center gap-2"
            style={{ borderRadius: 8 }}
          >
            {actionLoading[`${confirmModal.fileId}-cancel`] ? <Spinner size="sm" /> : <FaBan />}
            Yes, Cancel Batch
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .batch-queue-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .batch-queue-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default BatchQueue;
