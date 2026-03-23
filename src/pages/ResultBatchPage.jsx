import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Table, Spinner, Badge, Pagination } from "react-bootstrap";
import { ArrowLeft as LuArrowLeft, Download as LuDownload, ArrowRepeat } from "react-bootstrap-icons";

const ResultBatchPage = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 200;

  const fetchResults = async (page = 1) => {
    if (!fileId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/users/resultBatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, currentPage]);

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center mb-4 gap-3">
        <button 
          className="btn btn-outline-secondary d-flex align-items-center" 
          onClick={() => navigate(-1)}
        >
          <LuArrowLeft className="me-2" /> Back
        </button>
        <h2 className="mb-0 fw-bold">Batch Results: {fileId}</h2>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" className="text-danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted">Fetching results from ESB_LOG database...</p>
        </div>
      ) : resultsData && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex gap-4">
              <div>
                <span className="text-muted small d-block">Operation</span>
                <Badge bg="danger">{resultsData?.batchInfo?.operationType}</Badge>
              </div>
              <div>
                <span className="text-muted small d-block">Batch Status</span>
                <Badge bg="dark">{resultsData?.batchInfo?.etat}</Badge>
              </div>
              <div>
                <span className="text-muted small d-block">Matching Results</span>
                <strong className="text-success">{resultsData?.pagination?.totalRecords || 0}</strong> records
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={() => fetchResults(currentPage)}>
                <ArrowRepeat /> Refresh
              </button>
              <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handleExport}>
                <LuDownload /> Export Current View
              </button>
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
                        >
                          {r.STATUS || 'UNKNOWN'}
                        </Badge>
                      </td>
                      <td className="small">{r.PROCESS_ADDITION_MSG || r.MAIN_INFO || '-'}</td>
                      <td><Badge bg="light" text="dark" className="border shadow-sm">{r.TRACE_IN_STEP || '-'}</Badge></td>
                      <td className="small text-muted">{r.STATUS_DATE || r.CREATION_DATE || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <h5 className="text-muted">No results found for your batch.</h5>
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
                {[...Array(resultsData.pagination.totalPages)].map((_, idx) => (
                  <Pagination.Item 
                    key={idx + 1} 
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={currentPage === resultsData.pagination.totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(resultsData.pagination.totalPages, prev + 1))}
                />
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultBatchPage;
