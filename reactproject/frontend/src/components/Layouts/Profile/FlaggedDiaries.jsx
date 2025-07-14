import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const FlaggedDiaries = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [flaggedDiaries, setFlaggedDiaries] = useState([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    fetchFlag();
  }, [userID]);

  const fetchFlag = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flagged/${userID}`
      );
      setFlaggedDiaries(response.data);
      setFlaggedCount(response.data.length);
    } catch (error) {
      console.error("Error fetching flagged diaries:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        className="btn btn-danger py-2 px-3"
        onClick={handleShow}
        style={{ height: "100%" }}
      >
        <h5 className="m-0">Flagged Diaries: {flaggedCount}</h5>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Flagged Diaries</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="overflow-y-scroll custom-scrollbar pe-1"
            style={{ height: "20rem" }}
          >
            {isLoading ? (
              <>
                <p className="m-0">Loading flagged diaries.</p>
              </>
            ) : (
              <>
                {flaggedDiaries.length > 0 ? (
                  flaggedDiaries.map((diary) => (
                    <div key={diary.entryID}>
                      <Link
                        className="text-decoration-none text-dark"
                        to={`/DiaryEntry/${diary.entryID}`}
                      >
                        <h5
                          className="m-0 grayHover px-3 py-2 rounded"
                          style={{ backgroundColor: "transparent" }}
                        >
                          {diary.title} -{" "}
                          <span
                            style={{
                              fontSize: "clamp(0.5rem, .5vw + .5rem, .8rem)",
                            }}
                          >
                            {formatDate(diary.created_at)}
                          </span>
                        </h5>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>No flagged diaries found.</p>
                )}
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FlaggedDiaries;
