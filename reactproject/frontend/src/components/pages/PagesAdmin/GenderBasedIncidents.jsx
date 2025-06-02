import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../Layouts/MainLayout";
import axios from "axios";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../../Layouts/DiaryEntry/messageAlert";
import ReportTable from "../../Layouts/LayoutAdmin/GenderBasedIncidents/ReportTable";
import { Doughnut } from "react-chartjs-2";

export default function GenderBasedIncidents() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "addressed", or "unaddressed"
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const closeModal = () => {
    setModal({ show: false, message: "" });
  };
  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      message: "",
      onConfirm: () => {},
      onCancel: () => {},
    });
  };

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      if (parsedUser.isAdmin !== 1) {
        setModal({
          show: true,
          message: `Permission Denied: You are not authorized to access this page.`,
        });
        setTimeout(() => {
          parsedUser.isAdmin === 2
            ? navigate("/Admin/Home")
            : navigate("/Home");
        }, 1500);
      }
    } else {
      navigate("/");
    }

    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, reports]);

  const fetchReports = () => {
    axios
      .get("http://localhost:8081/reports")
      .then((response) => setReports(response.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to fetch reports")
      );
  };

  const applyFilter = () => {
    if (filter === "all") {
      setFilteredReports(reports);
    } else if (filter === "addressed") {
      setFilteredReports(reports.filter((r) => r.isAddress === 1));
    } else if (filter === "unaddressed") {
      setFilteredReports(reports.filter((r) => r.isAddress === 0));
    }
    setCurrentPage(1); // Reset to first page when the filter changes
  };

  const handleAddressed = (reportID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to mark this as addressed?`,
      onConfirm: async () => {
        axios
          .put(`http://localhost:8081/reports/${reportID}`)
          .then(() => {
            closeConfirmModal();
            setModal({
              show: true,
              message: `The case has been addressed.`,
            });
            fetchReports();
          })
          .catch((err) => {
            setError(
              err.response?.data?.error || "Failed to update case report"
            );
          });
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  const AddressStatusDonut = {
    labels: ["Awaiting", "Addressed"],
    datasets: [
      {
        data: [
          reports.filter((r) => !r.isAddress).length,
          reports.filter((r) => r.isAddress).length,
        ],
        backgroundColor: ["#ffff", "#00994d"],
        borderColor: ["#ffff"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true, // Ensures the chart resizes with the container
    maintainAspectRatio: false, // Allows you to control height & width manually
    plugins: {
      legend: {
        display: false, // Hide legend labels
      },
      tooltip: {
        enabled: true, // Show tooltips on hover
        position: "nearest",
      },
    },
  };

  return (
    <MainLayout ActiveTab="Complaints">
      <MessageAlert
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageAlert>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <div className="mt-0 mt-lg-2 pt-2 px-2">
        <div
          className="container rounded"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h4 className="text-light fw-bold m-0 mt-4 mt-lg-0 py-2">
            Gender-Based Incidents Complaints
          </h4>
        </div>

        <div className="container mt-2">
          <div className="row gap-1">
            <div className="col-md-3 p-0 gap-2">
              <div
                className=" rounded shadow-sm p-2 py-3"
                style={{ backgroundColor: "#00994d", height: "11em" }}
              >
                <div
                  className="position-relative text-light"
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                    zIndex: "0",
                  }}
                >
                  <Doughnut
                    className="overflow-visible"
                    data={AddressStatusDonut}
                    options={options}
                  />
                  <h3
                    className="m-0 position-absolute "
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      // color: "var(--primary)",
                      zIndex: "-1",
                    }}
                  >
                    {reports.filter((r) => !r.isAddress).length +
                      reports.filter((r) => r.isAddress).length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col p-0 d-flex gap-1 flex-column">
              <div className="row gap-1 m-auto w-100 ">
                <div
                  className="col d-flex flex-column align-items-center justify-content-center rounded shadow-sm text-light"
                  style={{ backgroundColor: "#00994d", height: "7rem" }}
                >
                  <h4 className="">Addressed</h4>
                  <h2 className="m-0">
                    {reports.filter((r) => r.isAddress).length}
                  </h2>{" "}
                </div>
                <div
                  className="col d-flex flex-column align-items-center justify-content-center rounded shadow-sm text-dark"
                  style={{ backgroundColor: "#ffff" }}
                >
                  <h4 className="">Awaiting Review</h4>
                  <h2 className="m-0">
                    {reports.filter((r) => !r.isAddress).length}
                  </h2>
                </div>
              </div>
              <FloatingLabel
                className="w-100"
                id="filterDropdown"
                controlId="filterDropdown"
                label="Case Status:"
              >
                <Form.Select
                  aria-label="Floating label select example"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="unaddressed">Unaddressed Cases</option>
                  <option value="addressed">Addressed Cases</option>
                </Form.Select>
              </FloatingLabel>
            </div>
          </div>
        </div>

        <ReportTable
          handleAddressed={handleAddressed}
          filteredReports={filteredReports} // <-- Pass filtered reports
          currentPage={currentPage} // <-- Pass current page
          setCurrentPage={setCurrentPage} // <-- Pass setCurrentPage function
          error={error}
        />
      </div>
    </MainLayout>
  );
}
