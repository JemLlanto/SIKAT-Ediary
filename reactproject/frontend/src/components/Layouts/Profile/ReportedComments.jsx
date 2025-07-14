import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const ReportedComments = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [reportedComments, setReportedComments] = useState([]);
  const [reportedCount, setReportedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const fetchReportedComments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/getReportedComments/${userID}`
      );
      setReportedComments(response.data);
      setReportedCount(response.data.length); // Update the count when the modal opens
    } catch (error) {
      console.error("Error fetching reported comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedComments(); // Fetch reported comments count on initial render
  }, [userID]);

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    if (timeDiff < 24 * 60 * 60 * 1000) {
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div>
      <button
        className="btn btn-danger py-1 px-3 d-flex align-items-center"
        onClick={handleShow}
        style={{ height: "100%" }}
      >
        <i className="bx bx-message-error d-sm-none"></i>
        <h5 className="m-0 d-none d-sm-block">
          Reported Comments: {reportedCount}
        </h5>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Reported Comments</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="overflow-y-scroll custom-scrollbar pe-1"
            style={{ height: "20rem" }}
          >
            {isLoading ? (
              <>
                <p className="m-0">Loading reported comments.</p>
              </>
            ) : (
              <>
                {reportedComments.length > 0 ? (
                  reportedComments.map((comment) => (
                    <div key={comment.commentID}>
                      <Link
                        className="text-decoration-none text-dark"
                        to={`/DiaryEntry/${comment.entryID}`}
                      >
                        <h5
                          className="m-0 grayHover px-3 py-2 rounded"
                          style={{ backgroundColor: "transparent" }}
                        >
                          {comment.text} -{" "}
                          {/* Reported by: {comment.reporterFirstName}{" "}
                      {comment.lastName} */}
                          <span
                            style={{
                              fontSize: "clamp(0.5rem, .5vw + .5rem, .8rem)",
                            }}
                          >
                            {formatDate(comment.created_at)}
                          </span>
                        </h5>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="m-0">No reported comments found.</p>
                )}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ReportedComments;
