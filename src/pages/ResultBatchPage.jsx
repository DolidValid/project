import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Table, Spinner, Badge, Pagination, ProgressBar } from "react-bootstrap";
import { 
  ArrowLeft as LuArrowLeft, 
  Download as LuDownload, 
  ArrowRepeat,
  PauseFill,
  PlayFill,
  StopFill,
  Trash,
  Clock,
  CalendarCheck,
  Files
} from "react-bootstrap-icons";

const API_BASE = "/api/users";

const ResultBatchPage = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 200;

  const getToken = () => localStorage.getItem("token");

  const fetchResults = async (page = 1, silent = false) => {
    if (!fileId) return;
    if (!silent) setLoading(true);
    setError("");

    try {
      const token = getToken();
      const res = await fetch("/api/users/resultBatch", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fileId, 
          page,
          pageSize
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResultsData(data);
      } else {
        const errData = await res.json();
        setError(`Fetch Failed: ${errData.error || "Could not retrieve results"}`);
      }
    } catch (err) {
      setError(`Network Error: ${err.message}`);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const confirmationMsg = action === 'cancel' 
      ? "Are you sure you want to cancel this batch? Processed records will remain."
      : action === 'remove' 
        ? "Are you sure you want to remove this batch? This will stop execution if it is running."
        : null;

    if (confirmationMsg && !window.confirm(confirmationMsg)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const controlAction = action === 'remove' ? 'cancel' : action;
      const res = await fetch(`${API_BASE}/batch-control/${controlAction}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ fileId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Failed to ${action}`);
      alert(`Success: Batch ${action === 'remove' ? 'removed' : action + 'ed'}`);
      await fetchResults(currentPage);
    } catch (err) {
      alert(`${action} failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(currentPage);
    
    // Auto-refresh logic: polls the backend every 3 seconds to keep progress and status updated
    intervalRef.current = setInterval(() => {
      // Only refresh if we're on the first page and no main fetch is currently running
      if (currentPage === 1 && !loading) {
        // We check current state to decide if we should poll
        const isStillActive = resultsData?.batchInfo?.etat === 'IN_PROGRESS' || 
                             resultsData?.batchInfo?.etat === 'PENDING' ||
                             resultsData?.batchInfo?.etat === 'PAUSED';
        
        if (isStillActive || !resultsData) {
          fetchResults(currentPage, true);
        }
      }
    }, 3000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, currentPage, resultsData?.batchInfo?.etat]);

  const handleExport = () => {
    window.print();
  };

  const getProgress = (progressStr) => {
    if (!progressStr) return { current: 0, total: 0, percent: 0 };
    const parts = progressStr.split('/');
    const current = parseInt(parts[0]) || 0;
    const total = parseInt(parts[1]) || 0;
    return { current, total, percent: total > 0 ? Math.round((current / total) * 100) : 0 };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const batchStatus = resultsData?.batchInfo?.etat;
  const runtimeState = resultsData?.batchInfo?.runtimeState;
  const isRunning = batchStatus === 'IN_PROGRESS' && runtimeState !== 'paused';
  const isPaused = runtimeState === 'paused' || batchStatus === 'PAUSED';
  const isPending = batchStatus === 'PENDING';
  const progress = getProgress(resultsData?.batchInfo?.progress);

  return (
    <div className="container-fluid py-4">
      {/* Top Header */}
      <div className="d-flex align-items-center mb-4 gap-3 justify-content-between flex-wrap">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary shadow-sm d-flex align-items-center" 
            onClick={() => navigate(-1)}
          >
            <LuArrowLeft className="me-2" /> Back
          </button>
          <h2 className="mb-0 fw-bold">Batch Details: {fileId}</h2>
        </div>
        
        <div className="d-flex gap-2">
          {isRunning && (
            <button 
              className="btn btn-warning shadow-sm d-flex align-items-center gap-2"
              onClick={() => handleAction('pause')}
              disabled={actionLoading}
            >
              <PauseFill size={18} /> Pause
            </button>
          )}
          {isPaused && (
            <button 
              className="btn btn-success shadow-sm d-flex align-items-center gap-2"
              onClick={() => handleAction('resume')}
              disabled={actionLoading}
            >
              <PlayFill size={18} /> Resume
            </button>
          )}
          {(isRunning || isPaused || isPending) && (
            <button 
              className="btn btn-danger shadow-sm d-flex align-items-center gap-2"
              onClick={() => handleAction('cancel')}
              disabled={actionLoading}
            >
              <StopFill size={18} /> Cancel
            </button>
          )}
          <button 
            className="btn btn-outline-danger shadow-sm d-flex align-items-center gap-2"
            onClick={() => handleAction('remove')}
            disabled={actionLoading}
          >
            <Trash size={18} /> Remove
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center gap-2">
          <Clock /> {error}
        </div>
      )}

      {loading && !resultsData ? (
        <div className="text-center py-5">
          <Spinner animation="border" className="text-danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Retrieving batch data...</p>
        </div>
      ) : resultsData && (
        <>
          {/* Progress & Info Card */}
          <div className="card shadow-sm border-0 mb-4 overflow-hidden" 
               style={{ borderLeft: `5px solid ${isPaused ? '#ffc107' : isRunning ? '#ed1c24' : '#6c757d'}` }}>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-8">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <h5 className="mb-0 fw-bold text-dark">{fileId}</h5>
                    <Badge bg={isPaused ? "warning" : isRunning ? "primary" : isPending ? "secondary" : "dark"} 
                           style={{ padding: '6px 12px', borderRadius: 8 }}>
                      {batchStatus}
                    </Badge>
                  </div>

                  <div className="d-flex flex-wrap gap-4 text-muted small">
                    <div className="d-flex align-items-center gap-1">
                      <Files size={14} className="text-danger" /> <strong>Operation:</strong> {resultsData?.batchInfo?.operationType}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <strong>Records:</strong> {resultsData?.batchInfo?.recordNumber || resultsData?.pagination?.totalRecords || 0}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <CalendarCheck size={14} className="text-danger" /> <strong>Scheduled:</strong> {formatDate(resultsData?.batchInfo?.executionDate)}
                    </div>
                  </div>

                  {/* Progress Section */}
                  {(isRunning || isPaused || batchStatus === 'FINISHED') && (
                    <div className="mt-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted fw-bold small">Processing Status</span>
                        <span className="fw-bold" style={{ color: '#ed1c24' }}>
                          {progress.current} / {progress.total} ({progress.percent}%)
                        </span>
                      </div>
                      <ProgressBar 
                        now={progress.percent} 
                        animated={isRunning}
                        striped={isPaused}
                        variant={isPaused ? "warning" : progress.percent === 100 ? "success" : "danger"}
                        style={{ height: 10, borderRadius: 10 }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="col-md-4 d-flex align-items-center justify-content-md-end border-start">
                  <div className="text-md-end">
                    <span className="text-muted small d-block mb-1">Upload Timestamp</span>
                    <strong className="d-block">{formatDate(resultsData?.batchInfo?.uploadDate || resultsData?.batchInfo?.CREATION_DATE)}</strong>
                    <div className="mt-3">
                      <button className="btn btn-sm btn-secondary me-2" onClick={() => fetchResults(currentPage)}>
                        <ArrowRepeat size={14} /> Refresh Data
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={handleExport}>
                        <LuDownload size={14} /> Export Results
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table Section */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Individual Transaction Results</h6>
              <div className="small text-muted">
                Showing {resultsData.transactionResults?.length || 0} of {resultsData.pagination?.totalRecords || 0} total records
              </div>
            </div>

            <div className="table-responsive">
              <Table striped borderless hover className="mb-0 align-middle">
                <thead className="bg-light text-muted">
                  <tr>
                    <th className="ps-4 py-3">MSISDN</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Step</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData?.transactionResults?.length > 0 ? (
                    resultsData.transactionResults.map((r, i) => (
                      <tr key={i}>
                        <td className="ps-4 fw-bold">{r.msisdn}</td>
                        <td className="small text-muted">{r.TRANSACTION_ID || r.transactionId}</td>
                        <td>
                          <Badge 
                            bg={r.STATUS === 'SUCCESS' || r.STATUS === 'FINISHED' ? 'success' : r.STATUS === 'PENDING' ? 'warning' : 'danger'}
                            style={{ borderRadius: 6 }}
                          >
                            {r.STATUS || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td className="small" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.PROCESS_ADDITION_MSG || r.MAIN_INFO || '-'}
                        </td>
                        <td><Badge bg="light" text="dark" className="border shadow-sm">{r.TRACE_IN_STEP || '-'}</Badge></td>
                        <td className="small text-muted">{r.STATUS_DATE || r.CREATION_DATE || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No transactions found yet for this batch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {resultsData?.pagination?.totalPages > 1 && (
              <div className="card-footer bg-white p-3 d-flex justify-content-center border-top">
                <Pagination className="mb-0 custom-pagination">
                  <Pagination.Prev 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  />
                  {[...Array(resultsData.pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (pageNum === 1 || pageNum === resultsData.pagination.totalPages || Math.abs(pageNum - currentPage) <= 2) {
                      return (
                        <Pagination.Item 
                          key={pageNum} 
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    } else if (pageNum === 2 || pageNum === resultsData.pagination.totalPages - 1) {
                      return <Pagination.Ellipsis key={pageNum} disabled />;
                    }
                    return null;
                  })}
                  <Pagination.Next 
                    disabled={currentPage === resultsData.pagination.totalPages} 
                    onClick={() => setCurrentPage(prev => Math.min(resultsData.pagination.totalPages, prev + 1))}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResultBatchPage;
