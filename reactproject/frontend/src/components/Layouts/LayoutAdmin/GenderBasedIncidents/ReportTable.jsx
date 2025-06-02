import React from "react";
import { Link } from "react-router-dom";
import { Pagination } from "react-bootstrap";

const ReportTable = ({
  handleAddressed,
  filteredReports,
  currentPage,
  setCurrentPage,
  error,
}) => {
  // Pagination logic
  const itemsPerPage = 8; // Number of reports per page
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  let items = [];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <>
      <div
        className="container mt-2 p-0 rounded overflow-auto custom-scrollbar"
        style={{ height: "22rem", backgroundColor: "#ffff" }}
      >
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <table className="table m-0">
            <thead
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f8f9fa",
                zIndex: 2,
              }}
            >
              <tr>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Case #</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Victim's Name</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Sex</h5>
                </th>
                <th
                  scope="col"
                  className="text-center align-middle"
                  style={{ width: "clamp(15rem, 20dvw, 20rem)" }}
                >
                  <h5 className="m-0">Subjects</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Date Filed</h5>
                </th>
                <th scope="col" className="text-center align-middle">
                  <h5 className="m-0">Actions</h5>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => (
                <tr className="" key={report.reportID}>
                  <th scope="row" className="text-center align-middle">
                    <p className="m-0 mt-1 d-flex align-items-center justify-content-center gap-1">
                      <div
                        className={`p-0 m-0 d-flex align-items-center justify-content-center ${
                          report.isAddress === 0 ? "bg-danger" : "bg-success"
                        }`}
                        style={{
                          height: ".6rem",
                          width: ".6rem",
                          borderRadius: "50%",
                          color: "#dc143c",
                        }}
                      ></div>
                      <p className="m-0">{report.reportID}</p>
                    </p>
                  </th>
                  <td
                    className={`text-center align-middle ${
                      report.victimName ? "" : "text-secondary"
                    }`}
                  >
                    <p className="m-0 mt-1">
                      {report.victimName ? report.victimName : "Not Provided"}
                    </p>
                  </td>
                  <td
                    className={`text-center align-middle ${
                      report.gender === "prefer not to say"
                        ? "text-secondary"
                        : ""
                    }`}
                  >
                    <p className="m-0 mt-1">
                      {report.gender === "prefer not to say"
                        ? "Prefer not to Say"
                        : report.gender}
                    </p>
                  </td>
                  <td className="text-center align-middle">
                    <p className="m-0 mt-1">{report.subjects}</p>
                  </td>
                  <td className="text-center align-middle">
                    <p className="m-0 mt-1">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td
                    className="text-center align-middle"
                    style={{ height: "100%" }}
                  >
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      {!report.isAddress && (
                        <button
                          className="btn btn-success text-light"
                          onClick={() => handleAddressed(report.reportID)}
                        >
                          <p className="m-0">Mark as Addressed</p>
                        </button>
                      )}
                      <Link to={`/Admin/CaseDetails/${report.reportID}`}>
                        <button
                          className="primaryButton rounded text-light py-2"
                          style={{ height: "100" }}
                        >
                          <p className="m-0">View Details</p>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="container d-flex justify-content-center mt-3">
        <Pagination size="sm">{items}</Pagination>
      </div>
    </>
  );
};

export default ReportTable;
