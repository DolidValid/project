import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Table, Alert, Spinner, Form, Pagination } from "react-bootstrap";

const Search = () => {
  const location = useLocation();

  const query = new URLSearchParams(location.search).get("query");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noInput, setNoInput] = useState(false); // <-- new state

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Local search filter
  const [filterMsisdn, setFilterMsisdn] = useState("");

  // Regex patterns
  const msisdnRegex = useMemo(() => /^213\d{9,12}$/, []);
  const infoFileIdRegex = useMemo(() => /^\d+-[A-Za-z0-9]+$/, []);
  const fileIdRegex = useMemo(() => /^Set3GProfile_\d+_\d+$/, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) {
        setNoInput(true); // mark no input
        setError("");
        setResult(null);
        return;
      }

      setNoInput(false);

      let body = {};
      if (msisdnRegex.test(query)) {
        body = { msisdn: query };
      } else if (infoFileIdRegex.test(query)) {
        body = { infoFileId: query };
      } else if (fileIdRegex.test(query)) {
        body = { fileId: query };
      } else {
        setError("Invalid input format.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/users/Search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setResult(data);
        setError("");
        setCurrentPage(1); // reset pagination on new search
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, msisdnRegex, infoFileIdRegex, fileIdRegex]);

  // Filter and paginate data
  const getFilteredData = () => {
    if (!Array.isArray(result)) return result;

    let filtered = result;
    if (filterMsisdn) {
      filtered = result.filter((row) =>
        String(row.msisdn || "")
          .toLowerCase()
          .includes(filterMsisdn.toLowerCase())
      );
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    return filtered.slice(startIndex, startIndex + rowsPerPage);
  };

  const renderPagination = () => {
    if (!Array.isArray(result)) return null;

    let filtered = result;
    if (filterMsisdn) {
      filtered = result.filter((row) =>
        String(row.msisdn || "")
          .toLowerCase()
          .includes(filterMsisdn.toLowerCase())
      );
    }

    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-3 justify-content-center">
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === currentPage}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    );
  };

  const renderTable = () => {
    if (!result) return null;

    // Array of objects
    if (Array.isArray(result) && result.length > 0) {
      const columns = Object.keys(result[0]);
      const paginatedData = getFilteredData();

      return (
        <>
          {columns.includes("msisdn") && (
            <Form className="mb-3">
              <Form.Control
                type="text"
                placeholder="Filter by MSISDN..."
                value={filterMsisdn}
                onChange={(e) => {
                  setFilterMsisdn(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </Form>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          {renderPagination()}
        </>
      );
    }

    // Single object
    if (typeof result === "object" && Object.keys(result).length > 0) {
      return (
        <Table striped bordered hover responsive>
          <tbody>
            {Object.entries(result).map(([key, value]) => (
              <tr key={key}>
                <th>{key}</th>
                <td>{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    }

    return <Alert variant="info">No results found.</Alert>;
  };

  return (
    <div className="container-fluid py-3">
      <h3 className="mb-3 text-center">Search Results</h3>

      {loading && (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" className="me-2" /> Loading...
        </div>
      )}

      {noInput && <Alert variant="warning">No input provided.</Alert>}

      {error && !noInput && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && !noInput && renderTable()}
    </div>
  );
};

export default Search;
