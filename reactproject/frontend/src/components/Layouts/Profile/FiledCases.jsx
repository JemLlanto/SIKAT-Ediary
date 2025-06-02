import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import axios from "axios";

const FiledCases = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [filedCases, setFiledCases] = useState([]);

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:8081/filedCases/${userID}`)
        .then((response) => {
          setFiledCases(response.data);
        })
        .catch((error) => {
          console.error("Error fetching gadify logs:", error);
        });
    }
  }, [userID]);

  const formatDate = (createdAt) => {
    const entryDate = new Date(createdAt);
    return entryDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric", // Include year if needed
    });
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  return (
    <div>
      <button
        className="w-100 btn btn-light text-start d-flex align-items-center gap-1"
        onClick={handleShow}
      >
        <i class="bx bx-file"></i>
        <p className="m-0">Filed Cases</p>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Filed Cases</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div
            className="overflow-y-scroll custom-scrollbar"
            style={{ height: "25rem" }}
          >
            <table class="table">
              <thead>
                <tr>
                  <th className="text-center align-middle w-25" scope="col">
                    <h5 className="m-0">Date Filed</h5>
                  </th>
                  <th className="text-center align-middle" scope="col">
                    <h5 className="m-0">Status</h5>
                  </th>
                  <th className="text-center align-middle" scope="col">
                    <h5 className="m-0">Action</h5>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filedCases.length > 0 ? (
                  filedCases.map((caseItem) => (
                    <tr key={caseItem.reportID}>
                      <th className="text-center align-middle" scope="row">
                        <p className="m-0">{formatDate(caseItem.created_at)}</p>
                      </th>
                      <td className="text-center align-middle">
                        <p className="m-0">
                          {caseItem.isAddress ? "Addressed" : "Pending"}
                        </p>
                      </td>
                      <td className="text-center align-middle">
                        <Link to={`/CaseDetails/${caseItem.reportID}`}>
                          <button className="primaryButton">
                            <p className="m-0">View</p>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center align-middle">
                      No filed cases available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FiledCases;
