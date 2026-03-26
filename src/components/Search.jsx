import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Table, Alert, Spinner, Badge, Pagination } from "react-bootstrap";
import { Search as LuSearch, CheckCircleFill, XCircleFill, ArrowRepeat } from "react-bootstrap-icons";

// Basic Ooredoo-styled search component integrating ESB_LOG results
const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const urlQuery = new URLSearchParams(location.search).get("query") || "";

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Regex patterns to auto-detect search type
  const msisdnRegex = useMemo(() => /^213\d{9,12}$/, []);
  const fileIdRegex = useMemo(() => /(ManualBatch|Set3GProfile|SetContractAndServices|SetContractStatus)_/, []);
  const transactionIdRegex = useMemo(() => /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/, []);

  const triggerSearch = async (searchVal) => {
    if (!searchVal.trim()) {
      setError("Please provide a search query.");
      setResult(null);
      return;
    }

    let body = {};
    const q = searchVal.trim();

    if (transactionIdRegex.test(q)) {
      body = { transactionId: q };
    } else if (msisdnRegex.test(q)) {
      body = { msisdn: q };
    } else if (fileIdRegex.test(q) || q.includes("_")) {
      body = { fileId: q };
    } else {
      // Default to trying Transaction ID or MSISDN depending on context
      if (!isNaN(q) && q.length >= 9) {
          body = { msisdn: q };
      } else {
          body = { transactionId: q }; // fallback
      }
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCurrentPage(1); // Reset page on new search

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/Search", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("API error fetching from ESB_LOG");

      const data = await res.json();
      setResult(data);

      if (data.length === 0) {
        setError(`No ESB_LOG results found for: ${q}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlQuery) {
      triggerSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput !== urlQuery) {
       navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    } else {
       triggerSearch(searchInput);
    }
  };

  const getPaginatedData = () => {
    const actualResults = Array.isArray(result) ? result : (result?.transactionResults || []);
    if (actualResults.length === 0) return [];
    
    // If backend already paginated, just return it
    if (result.pagination && actualResults.length <= rowsPerPage) {
       return actualResults;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    return actualResults.slice(startIndex, startIndex + rowsPerPage);
  };

  const renderPagination = () => {
    const actualResults = Array.isArray(result) ? result : (result?.transactionResults || []);
    const totalRecords = Array.isArray(result) ? result.length : (result?.pagination?.totalRecords || actualResults.length);
    const totalPages = Array.isArray(result) ? Math.ceil(totalRecords / rowsPerPage) : (result?.pagination?.totalPages || Math.ceil(totalRecords / rowsPerPage));
    
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4 justify-content-center custom-pagination">
        <Pagination.Prev 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        />
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === currentPage}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        />
      </Pagination>
    );
  };

  const renderTable = () => {
    if (!result) return null;
    
    // Support both old array format and new object format with pagination
    const actualResults = Array.isArray(result) ? result : (result.transactionResults || []);
    
    if (actualResults.length === 0) return null;

    const paginatedData = getPaginatedData();

    return (
      <div className="card shadow-sm border-0 mt-4 rounded-4 overflow-hidden">
         <div className="card-header bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
             <div>
                <h5 className="mb-0 fw-bold">Transaction Results</h5>
                <span className="text-muted small">
                  {Array.isArray(result) ? result.length : (result.pagination?.totalRecords || actualResults.length)} matches found in ESB_LOG
                </span>
             </div>
             <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={() => triggerSearch(searchInput)}>
                <ArrowRepeat /> Refresh List
             </button>
         </div>
        <div className="table-responsive">
          <Table striped borderless hover className="mb-0 align-middle">
            <thead className="bg-light text-muted">
              <tr>
                <th className="ps-4 py-3 text-nowrap">Transaction ID</th>
                <th>Status</th>
                <th>Message / MAIN_INFO</th>
                <th>Step</th>
                <th className="text-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((r, i) => (
                <tr key={i}>
                  <td className="ps-4 small text-muted font-monospace">{r.TRANSACTION_ID || r.transactionId}</td>
                  <td>
                    <Badge 
                      bg={r.STATUS === 'SUCCESS' || r.STATUS === 'FINISHED' ? 'success' : r.STATUS === 'PENDING' ? 'warning' : 'danger'}
                      className="px-3 py-2 rounded-pill shadow-sm"
                    >
                      {r.STATUS || 'UNKNOWN'}
                    </Badge>
                  </td>
                  <td className="small" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.PROCESS_ADDITION_MSG || r.MAIN_INFO || r.MESSAGE || r.mainInfo || '-'}
                  </td>
                  <td><Badge bg="light" text="dark" className="border shadow-sm">{r.TRACE_IN_STEP || r.STEP || r.step || r.trace_in_step || '-'}</Badge></td>
                  <td className="small text-muted text-nowrap">{r.STATUS_DATE || r.CREATION_DATE || r.DATE || r.date || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="card-footer bg-white border-top border-0">
          {renderPagination()}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-5" style={{ minHeight: "80vh" }}>
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          
          <div className="text-center mb-5">
            <div className="d-inline-flex justify-content-center align-items-center rounded-circle bg-danger bg-opacity-10 text-danger mb-3" style={{ width: '64px', height: '64px' }}>
              <LuSearch size={32} />
            </div>
            <h2 className="fw-bold mb-2">Global Transaction Search</h2>
            <p className="text-muted">Search directly within the ESB_LOG database by MSISDN, File ID, or Transaction ID.</p>
          </div>

          <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-5">
            <div className="card-body p-4 bg-white p-md-5">
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0 border-danger border-2 text-danger px-4">
                    <LuSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 border-danger border-2 shadow-none"
                    placeholder="Enter MSISDN, File ID, or Transaction UUID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ fontSize: '1.2rem', padding: '1rem', borderLeftColor: 'transparent' }}
                  />
                  <button 
                    className="btn btn-danger px-5 fw-bold text-uppercase tracking-wider" 
                    type="submit" 
                    style={{ background: 'var(--ooredoo-red, #ed1c24)', borderColor: 'var(--ooredoo-red, #ed1c24)' }}
                  >
                    {loading ? <Spinner size="sm" /> : "Search"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="shadow-sm border-0 border-start border-4 border-danger rounded-3 py-3 px-4 d-flex align-items-center">
              <XCircleFill size={24} className="me-3" />
              <div>
                <h6 className="mb-0 fw-bold">Search Error</h6>
                <span className="small">{error}</span>
              </div>
            </Alert>
          )}

          {!loading && !error && renderTable()}

        </div>
      </div>
    </div>
  );
};

export default Search;
