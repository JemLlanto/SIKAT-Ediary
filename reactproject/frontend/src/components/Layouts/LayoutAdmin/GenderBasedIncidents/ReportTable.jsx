import { useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";

const ReportTable = ({
  fetchReports,
  isLoading,
  filteredReports,
  currentPage,
  setCurrentPage,
  error,
}) => {
  // Pagination logic
  const itemsPerPage = 8; // Number of reports per page
  const [isLoadingAdd, setIsLoadingAdd] = useState();
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddressed = async (reportID) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark this report as addressed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark as addressed",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        setIsLoadingAdd(reportID);

        await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/incidents/reports/${reportID}`
        );

        await Swal.fire({
          title: "Success!",
          text: "The case has been addressed.",
          icon: "success",
          confirmButtonText: "OK",
        });

        fetchReports();
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || "Failed to update case report",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsLoadingAdd();
      }
    }
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
              {isLoading ? (
                <>
                  <tr>
                    <td
                      colSpan={7}
                      scope="row"
                      className="text-center align-middle"
                    >
                      <h5 className="m-0 text-secondary ">
                        <span className="d-flex align-items-center justify-content-center gap-1">
                          <i className="bx bx-loader bx-spin"></i>Loading
                          reports.
                        </span>
                      </h5>
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  {paginatedReports.map((report) => (
                    <tr className="" key={report.reportID}>
                      <th scope="row" className="text-center align-middle">
                        <p className="m-0 mt-1 d-flex align-items-center justify-content-center gap-1">
                          <div
                            className={`p-0 m-0 d-flex align-items-center justify-content-center ${
                              report.isAddress === 0
                                ? "bg-danger"
                                : "bg-success"
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
                          {report.victimName
                            ? report.victimName
                            : "Not Provided"}
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
                              disabled={isLoadingAdd === report.reportID}
                            >
                              <p className="m-0">
                                {isLoadingAdd === report.reportID ? (
                                  <>
                                    <i className="bx bx-loader bx-spin"></i>
                                  </>
                                ) : (
                                  <>Mark as Addressed</>
                                )}
                              </p>
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
                </>
              )}
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
