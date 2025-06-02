import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Tab, Tabs } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";

const ActivityLogs = ({ userID }) => {
  const [showModal, setShowModal] = useState(false);
  const [gadifyLogs, setGadifyLogs] = useState([]);
  const [commentLogs, setCommentLogs] = useState([]);
  const [flagLog, setFlaggedLogs] = useState([]);

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:8081/actvity_logs/gadify/${userID}`)
        .then((response) => {
          setGadifyLogs(response.data);
        })
        .catch((error) => {
          console.error("Error fetching gadify logs:", error);
        });
    }
  }, [userID]);

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:8081/actvity_logs/comments/${userID}`)
        .then((response) => {
          setCommentLogs(response.data);
        })
        .catch((error) => {
          console.error("Error fetching comment logs:", error);
        });
    }
  }, [userID]);

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:8081/actvity_logs/flags/${userID}`)
        .then((response) => {
          setFlaggedLogs(response.data);
        })
        .catch((error) => {
          console.error("Error fetching flag logs:", error);
        });
    }
  }, [userID]);

  const timeAgo = (createdAt) => {
    const entryDate = new Date(createdAt);
    const now = new Date();
    const timeDiff = now - entryDate;

    const diffInHours = Math.floor(timeDiff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (timeDiff < 24 * 60 * 60 * 1000) {
      if (diffInHours < 1) {
        return "Just now";
      }
      return `${diffInHours} hrs ago`;
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <div>
      <button
        className="w-100 btn btn-light text-start d-flex align-items-center gap-1"
        onClick={handleShow}
      >
        <i class="bx bx-history"></i>
        <p className="m-0">Activity log </p>
      </button>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Activity Logs </h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          <Tabs defaultActiveKey="gadify" id="followerAndFollowing">
            <Tab eventKey="gadify" title="Gadify" className="pt-1">
              <div
                className="overflow-y-scroll custom-scrollbar pe-1 pt-1"
                style={{ height: "25rem" }}
              >
                {gadifyLogs.map((gadify) => (
                  <Link
                    key={gadify.gadifyID}
                    to={`/DiaryEntry/${gadify.entryID}`}
                    className="d-flex align-items-center text-decoration-none py-2 ps-3 mb-2 grayHover rounded bg-transparent"
                  >
                    <p className="m-0">
                      {gadify.firstName}'s Diary - {gadify.title}
                      <span
                        style={{ fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)" }}
                      >
                        {timeAgo(gadify.created_at)}
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </Tab>
            <Tab eventKey="comment" title="Comment" className="pt-1">
              <div
                className="overflow-y-scroll custom-scrollbar pe-1 pt-1"
                style={{ height: "25rem" }}
              >
                {commentLogs.map((comment) => (
                  <Link
                    key={comment.commentID}
                    to={`/DiaryEntry/${comment.entryID}`}
                    className="d-flex align-items-center py-2 ps-3 mb-2 grayHover rounded bg-transparent linkText"
                  >
                    <p className="m-0">
                      {comment.firstName}'s Diary - {comment.text}{" "}
                      <span
                        style={{ fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)" }}
                      >
                        {timeAgo(comment.created_at)}
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </Tab>
            <Tab eventKey="flag" title="Flag" className="pt-1">
              <div
                className="overflow-y-scroll custom-scrollbar pe-1 pt-1"
                style={{ height: "25rem" }}
              >
                {flagLog.map((flag) => (
                  <Link
                    key={flag.report_id}
                    to={`/DiaryEntry/${flag.entryID}`}
                    className="d-flex align-items-center py-2 ps-3 mb-2 grayHover rounded bg-transparent linkText"
                  >
                    <p className="m-0">
                      {flag.firstName}'s Diary - {flag.reasons}{" "}
                      <span
                        style={{ fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)" }}
                      >
                        {timeAgo(flag.created_at)}
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ActivityLogs;
