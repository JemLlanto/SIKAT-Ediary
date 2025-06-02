import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../Layouts/MainLayout";
import BackButton from "../../Layouts/Home/BackButton";
import { jsPDF } from "jspdf";
import CaseDetailDownloadButton from "../../Layouts/DownloadButton/CaseDetailDownloadButton";

const CaseDetails = () => {
  const { reportID } = useParams();
  const [caseDetails, setCaseDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Fetch case details based on reportID
    axios
      .get(`http://localhost:8081/reports/${reportID}`)
      .then((response) => {
        console.log(response.data);
        setCaseDetails(response.data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load case details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportID]);

  const handleAddressed = (reportID) => {
    const confirmed = window.confirm(
      "Are you sure you want to address this entry?"
    );
    if (confirmed) {
      axios
        .put(`http://localhost:8081/reports/${reportID}`)
        .then(() => {
          alert("The case has been addressed!");
          fetchReports();
        })
        .catch((err) => {
          setError(err.response?.data?.error || "Failed to update case report");
        });
    }
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <MainLayout ActiveTab="Complaints">
        <div className="d-flex justify-content-center py-3">
          <p>Loading case details...</p>
        </div>
      </MainLayout>
    );
  }

  const documents = Array.isArray(caseDetails.supportingDocuments)
    ? caseDetails.supportingDocuments
    : [caseDetails.supportingDocuments];
  // If it's not an array, convert it into one

  if (error) {
    return (
      <MainLayout ActiveTab="Complaints">
        <div className="d-flex justify-content-center py-3">
          <p className="text-danger">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout ActiveTab="Complaints">
      <div className="d-flex justify-content-center py-3 mt-3">
        <div
          className="rounded shadow p-3"
          style={{
            backgroundColor: "#ffff",
            width: "clamp(30rem, 70vw, 50rem)",
          }}
        >
          <div className="position-relative border-bottom border-2 d-flex align-items-end justify-content-center gap-2 pb-2">
            {/* <Link
              className="position-absolute text-dark"
              style={{ left: "0" }}
              to="/Home"
            >
              <i className="bx bx-arrow-back bx-sm"></i>
            </Link> */}
            <BackButton></BackButton>

            <h4 className="m-0">
              Case Details{" "}
              <span
                className={`${
                  caseDetails.isAddress ? "text-success" : "text-danger"
                }`}
              >
                {caseDetails.isAddress ? "(Addressed)" : "(Pending)"}
              </span>
            </h4>
          </div>

          <form className="text-start" style={{ minHeight: "20rem" }}>
            <h5 className="mt-3">Victim Details</h5>
            <div className="px-2 d-flex flex-column gap-2">
              <div className="row gap-2">
                <div className="col-md-7">
                  <h6 className="m-0">Name</h6>
                  <p className="m-0 ps-2 border-bottom text-secondary">
                    {caseDetails.victimName ? (
                      caseDetails.victimName
                    ) : (
                      <>
                        <p className="m-0">No Name Provided</p>
                      </>
                    )}
                  </p>
                </div>
                <div className="col-md">
                  <h6 className="m-0">Sex</h6>
                  <p className="m-0 ps-2 border-bottom text-secondary">
                    {caseDetails.gender ? (
                      caseDetails.gender
                    ) : (
                      <>Prefer not to say.</>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h6 className="m-0">Contact Number</h6>
                <p className="m-0 ps-2 border-bottom text-secondary">
                  {caseDetails.contactInfo}
                </p>
              </div>
            </div>
            {/* Incident Details */}
            <h5 className="mt-3">
              Incident Details{" "}
              <span className="text-success">*{caseDetails.subjects}</span>
            </h5>
            <div className="px-2 d-flex flex-column gap-3">
              <div className="row">
                <div className="col-md-7">
                  <h6 className="m-0">Perpetrator's Name</h6>
                  <p className="m-0 ps-2 border-bottom text-secondary">
                    {caseDetails.perpetratorName ? (
                      caseDetails.perpetratorName
                    ) : (
                      <>
                        <p className="m-0">No Name Provided</p>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-7">
                  <h6 className="m-0">Location</h6>
                  <p className="m-0 ps-2 border-bottom text-secondary">
                    {caseDetails.location}
                  </p>
                </div>
                <div className="col-md">
                  <h6 className="m-0">Date</h6>
                  <p className="m-0 ps-2 border-bottom text-secondary">
                    {new Date(caseDetails.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <h6 className="m-0">Description</h6>
                <p className="m-0 ps-2 border-bottom text-secondary">
                  {caseDetails.incidentDescription}
                </p>
              </div>
            </div>

            <div>
              <h5 className="mt-3">Proof of Incident</h5>
              <div className="d-flex flex-wrap gap-2">
                {caseDetails.supportingDocuments &&
                Array.isArray(JSON.parse(caseDetails.supportingDocuments)) &&
                JSON.parse(caseDetails.supportingDocuments).length > 0 ? (
                  JSON.parse(caseDetails.supportingDocuments).map(
                    (document, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleImageClick(`http://localhost:8081${document}`)
                        }
                      >
                        <div
                          className="supportImageContainer overflow-hidden border-0"
                          style={{
                            cursor: "pointer",
                            width: "clamp(8rem, 10vw, 10rem)",
                            height: "clamp(8rem, 10vw, 10rem)",
                          }}
                        >
                          <img
                            src={`http://localhost:8081${document}`} // Displaying the supporting document as an image
                            alt={`Supporting Document ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p>No supporting documents available.</p>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end flex-column gap-1 mt-2">
              <CaseDetailDownloadButton
                caseDetails={caseDetails}
              ></CaseDetailDownloadButton>
            </div>
          </form>
        </div>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Body className="p-0 d-flex justify-content-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Enlarged proof"
                style={{ width: "auto", height: "60vh" }}
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default CaseDetails;
