import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import sampleImage from "../../../assets/Background.jpg";
import MessageAlert from "../../Layouts/DiaryEntry/messageAlert";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";
import BackButton from "../../Layouts/Home/BackButton";
import Swal from "sweetalert2";
import CaseDetailDownloadButton from "../../Layouts/DownloadButton/CaseDetailDownloadButton";

const CaseDetails = () => {
  const { reportID } = useParams();
  const [caseDetails, setCaseDetails] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const fetchReportDetails = () => {
    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/incidents/reports/${reportID}`,
      )
      .then((response) => {
        // console.log(response.data);
        setCaseDetails(response.data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load case details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Fetch case details based on reportID
    fetchReportDetails();
  }, [reportID]);

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
        setIsLoadingAdd(true);

        const res = await axios.put(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/incidents/reports/${reportID}`,
        );

        if (res.status === 200) {
          fetchReportDetails();
          await Swal.fire({
            title: "Success!",
            text: "The case has been addressed.",
            icon: "success",
            confirmButtonText: "OK",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.error || "Failed to update case report",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsLoadingAdd(false);
      }
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

  let raw = caseDetails.supportingDocuments;
  let supportDocuments = [];

  if (Array.isArray(raw)) {
    supportDocuments = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      supportDocuments = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      supportDocuments = [raw]; // fallback in case it's a plain string
    }
  }

  console.log("Supporting docs", supportDocuments);
  console.log("Supporting doc", caseDetails.supportingDocuments);

  return (
    <>
      <BackButton />
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
      <div className="d-flex justify-content-center py-3 mt-3 mt-md-1 pt-5 pt-lg-0">
        <div
          className="rounded shadow p-3"
          style={{
            backgroundColor: "#ffff",
            width: "clamp(30rem, 70vw, 50rem)",
          }}
        >
          <div className="position-relative border-bottom border-2 d-flex align-items-end justify-content-center gap-2 pb-2">
            <h4 className="m-0">
              Case Details{" "}
              <span
                className={`${
                  caseDetails.isAddress ? "text-success" : "text-danger"
                }`}
              >
                {loading ? null : (
                  <>{caseDetails.isAddress ? "(Addressed)" : "(Pending)"}</>
                )}
              </span>
            </h4>
          </div>
          {loading ? (
            <>
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "30rem" }}
              >
                <h2>
                  <i className="bx bx-loader bx-spin"></i>
                </h2>
                <h5 className="m-0">Loading details.</h5>
              </div>
            </>
          ) : (
            <>
              {" "}
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

                {/* SUPPRTING DOCS */}
                <div>
                  <h5 className="mt-3">Proof of Incident</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {supportDocuments &&
                    Array.isArray(supportDocuments) &&
                    supportDocuments.length > 0 ? (
                      supportDocuments.map((document, index) => (
                        <div
                          key={index}
                          onClick={() =>
                            handleImageClick(supportDocuments[index])
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
                              src={supportDocuments[index]} // Displaying the supporting document as an image
                              alt={`Supporting Document ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No supporting documents available.</p>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end flex-column gap-1 mt-2">
                  {caseDetails.isAddress ? (
                    ""
                  ) : (
                    <button
                      className="primaryButton w-100 py-2"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default form submission behavior
                        handleAddressed(reportID);
                      }}
                      disabled={isLoadingAdd}
                    >
                      <p className="m-0">
                        {isLoadingAdd ? (
                          <>
                            <i className="bx bx-loader bx-spin"></i>
                          </>
                        ) : (
                          <>Mark as Addressed</>
                        )}
                      </p>
                    </button>
                  )}

                  <CaseDetailDownloadButton
                    caseDetails={caseDetails}
                  ></CaseDetailDownloadButton>
                </div>
              </form>
            </>
          )}
        </div>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Body className="p-0 d-flex justify-content-center">
            {selectedImage && (
              <>
                <div
                  className="bg-light position-absolute rounded p-2"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "clamp(18rem, 70vw, 60rem)",
                    height: "clamp(20rem, 50vw, 30rem)",
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Enlarged proof"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default CaseDetails;
