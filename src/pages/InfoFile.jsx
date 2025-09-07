import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RedButton from "../components/Button/PrimaryButton";

const InfoFile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Saving...");

    try {
      const response = await fetch("http://localhost:5000/api/users/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to insert data");
      }

      setMessage("Data inserted successfully.");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");

      // ✅ Pass phone to ImportBatch
      navigate("/ImportBatch", { state: { phone } });
    } catch (error) {
      setMessage(`Error inserting data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div className="row w-100">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4 mx-auto">
          <div className="p-4 border rounded shadow bg-light">
            <form onSubmit={handleSubmit}>
              {/* Inputs */}
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  id="phone"
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <RedButton
                type="submit"
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </RedButton>
            </form>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoFile;
