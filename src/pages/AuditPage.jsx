import { useState, useEffect } from "react";
import { Table, Spinner, Badge, Card, Container, Button, Form } from "react-bootstrap";
import { FaShieldAlt, FaSync, FaFilter, FaUser, FaUpload, FaPause, FaPlay, FaBan } from "react-icons/fa";

const API_BASE = "/api/users";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterUser, setFilterUser] = useState("");

  const getToken = () => sessionStorage.getItem("token");

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/audit-logs`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch audit logs");

      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Apply filters whenever logs/filters change
  useEffect(() => {
    let result = [...logs];

    if (filterAction !== "ALL") {
      result = result.filter(log => log.action === filterAction);
    }

    if (filterUser.trim()) {
      result = result.filter(log =>
        log.username?.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    setFilteredLogs(result);
  }, [logs, filterAction, filterUser]);

  const getActionIcon = (action) => {
    switch (action) {
      case "UPLOAD_BATCH": return <FaUpload className="me-1" />;
      case "PAUSE_BATCH": return <FaPause className="me-1" />;
      case "RESUME_BATCH": return <FaPlay className="me-1" />;
      case "CANCEL_BATCH": return <FaBan className="me-1" />;
      case "SINGLE_ACTIVATION": return <FaUser className="me-1" />;
      default: return null;
    }
  };

  const getActionBadge = (action) => {
    const map = {
      "UPLOAD_BATCH": { bg: "primary", label: "Upload" },
      "PAUSE_BATCH": { bg: "warning", label: "Pause" },
      "RESUME_BATCH": { bg: "success", label: "Resume" },
      "CANCEL_BATCH": { bg: "danger", label: "Cancel" },
      "SINGLE_ACTIVATION": { bg: "info", label: "Activation" },
    };
    const cfg = map[action] || { bg: "secondary", label: action };
    return (
      <Badge bg={cfg.bg} style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: 6 }}>
        {getActionIcon(action)}
        {cfg.label}
      </Badge>
    );
  };

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(logs.filter(l => l.action).map(l => l.action))];

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark d-flex align-items-center">
          <FaShieldAlt className="me-2 text-danger" /> Audit Log
        </h2>
        <Button variant="outline-danger" onClick={fetchAuditLogs} disabled={loading}>
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body className="d-flex align-items-center gap-3 flex-wrap py-2">
          <FaFilter className="text-muted" />
          <Form.Group className="d-flex align-items-center gap-2 mb-0">
            <Form.Label className="mb-0 small fw-semibold text-muted">Action:</Form.Label>
            <Form.Select
              size="sm"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ width: 'auto', minWidth: 150 }}
            >
              <option value="ALL">All Actions</option>
              {uniqueActions.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="d-flex align-items-center gap-2 mb-0">
            <Form.Label className="mb-0 small fw-semibold text-muted">User:</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="Filter by username"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              style={{ width: 'auto', minWidth: 180 }}
            />
          </Form.Group>

          <Badge bg="light" text="dark" className="ms-auto" style={{ fontSize: '0.8rem' }}>
            {filteredLogs.length} / {logs.length} entries
          </Badge>
        </Card.Body>
      </Card>

      {error && <div className="alert alert-danger shadow-sm">{error}</div>}

      {loading && logs.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Loading audit logs...</p>
        </div>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <tr key={idx} className="align-middle">
                        <td className="ps-4 text-muted small" style={{ whiteSpace: 'nowrap' }}>
                          <div>{log.localTime || log.timestamp}</div>
                          {log.localTime && (
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {log.timestamp}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FaUser className="text-secondary" size={12} />
                            <span className="fw-semibold">{log.username || "—"}</span>
                          </div>
                        </td>
                        <td>{getActionBadge(log.action)}</td>
                        <td className="small text-muted" style={{ maxWidth: 400 }}>
                          {log.details || log.raw || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <p className="text-muted mb-0">
                          {logs.length === 0
                            ? "No audit logs found."
                            : "No logs match the current filters."}
                        </p>
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

export default AuditPage;
