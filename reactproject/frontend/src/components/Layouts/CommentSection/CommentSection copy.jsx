import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import AnonymousIcon from "../../../assets/Anonymous.png";
import Button from "react-bootstrap/Button";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import ReportButton from "./ReportCommentButton";

const CommentSection = ({ userID, entryID, entry, firstName }) => {
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState([]);

  const [editCommentID, setEditCommentID] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const replyTextsRef = useRef({});
  const newCommentRef = useRef(null);
  const newReplyRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      window.location.href = "/";
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchComments/${entryID}`
      );
      const fetchedComments = response.data;
      const nestedComments = nestComments(fetchedComments);
      setComments(nestedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to fetch comments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [entryID]);

  useEffect(() => {
    if (show) {
      fetchComments();
    }
  }, [show, fetchComments]);

  const nestComments = (comments) => {
    const commentMap = {};
    const nested = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.commentID] = comment;
      if (!comment.replyCommentID) {
        nested.push(comment);
      } else {
        const parent = commentMap[comment.replyCommentID];
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    return nested;
  };

  const handleSendComment = async () => {
    if (!userID || !entryID || newComment.trim() === "") {
      console.error("User ID, Entry ID, and comment text are required.");
      return;
    }

    const newCommentObj = {
      userID,
      entryID,
      text: newComment,
    };

    setLoading(true);
    try {
      await axios.post("http://localhost:8081/comments", newCommentObj);
      setNewComment("");
      fetchComments();
      // Scroll to the newly added comment after it is added
      setTimeout(() => {
        newCommentRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }

    if (userID !== entry) {
      axios
        .post(`http://localhost:8081/notifications/${entry}`, {
          userID: entry,
          actorID: userID,
          entryID,
          profile_image: user.profile_image,
          type: "comment",
          message: `${user.username} commented on your diary entry.`,
        })
        .catch((err) => {
          console.error("Error sending comment notification:", err);
          setError("Failed to send notification.");
        });
    }
  };

  const handleReplyTextChange = (commentID, value) => {
    replyTextsRef.current[commentID] = value;
  };

  const handleSendReply = async (parentID) => {
    const replyText = replyTextsRef.current[parentID] || "";
    if (replyText.trim() === "") return;

    const newReplyObj = {
      userID,
      entryID,
      text: replyText,
      replyCommentID: parentID,
    };

    setLoading(true);
    try {
      await axios.post("http://localhost:8081/comments", newReplyObj);
      setReplyTo(null);
      replyTextsRef.current[parentID] = "";
      fetchComments();

      // Keep the current accordion open and scroll to the new reply
      setOpenAccordions((prevOpen) => [...prevOpen, parentID]);
      setTimeout(() => {
        newReplyRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error posting reply:", error);
      setError("Failed to post reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = useCallback((comment) => {
    setEditCommentID(comment.commentID);
    setEditCommentText(comment.text);
  }, []);

  const handleSaveEditComment = useCallback(async () => {
    if (!editCommentText.trim()) return; // Ensure non-empty edit text
    setLoading(true);
    try {
      await axios.put(`http://localhost:8081/editComment/${editCommentID}`, {
        text: editCommentText,
      });
      setEditCommentID(null);
      setEditCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Failed to edit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [editCommentID, editCommentText, fetchComments]);

  const handleDeleteComment = async (commentID) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8081/deleteComment/${commentID}`);
        fetchComments(); // Refresh comments after deletion
      } catch (error) {
        console.error("Error deleting comment:", error);
        setError("Failed to delete comment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    setReplyTo(null);
    replyTextsRef.current = {};
    setError(null);
  };

  const handleShow = () => setShow(true);

  const toggleAccordion = (commentID) => {
    if (openAccordions.includes(commentID)) {
      setOpenAccordions((prevOpen) =>
        prevOpen.filter((id) => id !== commentID)
      );
    } else {
      setOpenAccordions((prevOpen) => [...prevOpen, commentID]);
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

  const Comment = React.memo(({ comment, depth = 0 }) => {
    const canManage = comment.userID === userID;
    const isAccordionOpen = openAccordions.includes(comment.commentID);
    return (
      <div
        className="position-relative"
        style={{ marginLeft: depth * 20, marginTop: "10px" }}
        ref={comment.commentID === replyTo ? newReplyRef : null}
      >
        <div
          className="position-absolute border-start rounded-5 border-2"
          style={{ height: "85%", width: "3%", left: "25px", zIndex: "1" }}
        ></div>

        {/* Profile */}
        <div className="d-flex align-items-start flex-column gap-2 pb-2">
          <div className="w-100 d-flex align-items-center justify-content-between pe-3">
            <Link
              to={`/Profile/${comment.userID}`}
              className="linkText rounded"
            >
              <div className="d-flex align-items-center gap-2">
                <div
                  className="profilePicture d-flex align-items-center justify-content-center"
                  style={{ zIndex: "2" }}
                >
                  <img
                    src={
                      comment.profile_image
                        ? `http://localhost:8081${comment.profile_image}`
                        : AnonymousIcon
                    }
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-start flex-column">
                  <h5 className="m-0 text-start">{comment.username}</h5>
                </div>
              </div>
            </Link>
            {/* FOR COMMENT OPTIONS */}
            <div>
              <Dropdown>
                <Dropdown.Toggle
                  className="btn-light d-flex align-items-center pt-0 pb-2"
                  id="dropdown-basic"
                  bsPrefix="custom-toggle"
                >
                  <h5 className="m-0">...</h5>
                </Dropdown.Toggle>

                <Dropdown.Menu className="p-2 ">
                  {!canManage && (
                    <Dropdown.Item className="p-0 btn btn-light">
                      <ReportButton
                        commentID={comment.commentID}
                        userID={comment.userID}
                        username={comment.username}
                        entryID={entryID}
                      />
                    </Dropdown.Item>
                  )}

                  {canManage && (
                    <Dropdown.Item className="p-0 btn btn-light ">
                      <button
                        className="btn btn-light w-100 "
                        onClick={() => handleDeleteComment(comment.commentID)}
                      >
                        Delete
                      </button>
                    </Dropdown.Item>
                  )}
                  {canManage && (
                    <Dropdown.Item className="p-0 btn btn-light ">
                      <button
                        className="btn btn-light w-100"
                        onClick={() => handleEditComment(comment)}
                      >
                        Edit
                      </button>
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div>
          <div className="ps-5 ms-2 d-flex align-items-center gap-2">
            <p
              className="m-0 p-2 rounded border-2 text-secondary"
              style={{
                whiteSpace: "pre-wrap",
                maxWidth: "500px",
                width: "fit-content",
                wordWrap: "break-word",
                backgroundColor: "var(--background_light)",
              }}
              ref={
                comment.commentID === comments[comments.length - 1]?.commentID
                  ? newCommentRef
                  : null
              }
            >
              {comment.text}
            </p>
            <p className="m-0" style={{ fontSize: ".7rem", color: "gray" }}>
              {formatDate(comment.created_at)}
            </p>
          </div>

          <div className="ps-5 d-flex align-items-center gap-2">
            <button className="btn btn-light btn-sm ">Gadify</button>
            <button
              className="btn btn-light btn-sm"
              onClick={() => setReplyTo(comment.commentID)}
            >
              Reply
            </button>
          </div>

          {editCommentID === comment.commentID ? (
            <div className="mb-2 w-100"></div>
          ) : (
            <div></div>
          )}
        </div>

        {replyTo === comment.commentID && (
          <div className="ps-5 mt-2">
            <FloatingLabel
              controlId={`replyTextarea-${comment.commentID}`}
              label="Reply"
            >
              <Form.Control
                as="textarea"
                placeholder="Leave a reply here"
                style={{ height: "80px" }}
                onChange={(e) =>
                  handleReplyTextChange(comment.commentID, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply(comment.commentID);
                  }
                }}
              />
              <button
                onClick={() => handleSendReply(comment.commentID)}
                className="position-absolute py-2 d-flex align-items-center justify-content-center border-0"
                style={{
                  height: "40px",
                  width: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ffff",
                  right: "10px",
                  bottom: "10px",
                  color: "var(--primary)",
                }}
              >
                <i className="bx bxs-send bx-sm"></i>
              </button>
            </FloatingLabel>
          </div>
        )}

        {comment.replies.length > 0 && (
          <Accordion
            className="commentAccordion text-secondary mt-2 ps-4"
            activeKey={isAccordionOpen ? `reply-${comment.commentID}` : null}
            onSelect={() => toggleAccordion(comment.commentID)}
          >
            <Accordion.Item eventKey={`reply-${comment.commentID}`}>
              <Accordion.Header>
                View Replies ({comment.replies.length})
              </Accordion.Header>
              <Accordion.Body>
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply.commentID}
                    comment={reply}
                    depth={depth + 1}
                  />
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}
      </div>
    );
  });

  return (
    <>
      <button
        className="InteractButton d-flex align-items-center justify-content-center gap-2"
        onClick={handleShow}
      >
        <i className="bx bx-comment"></i>
        <span>{comments.length}</span>
        <p className="m-0 d-none d-md-block">Comments</p>
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">
              Comments on {firstName}'s
              {user.isAdmin ? " Post" : " Diary"}
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex flex-column justify-content-between"
          style={{ height: "33rem" }}
        >
          <div className="pe-2" style={{ overflowY: "scroll", height: "100%" }}>
            {loading && <p className="text-center">Loading comments...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && comments.length === 0 && (
              <p className="text-center">
                No comments yet. Be the first to share your thoughts.
              </p>
            )}
            {comments.map((comment) => (
              <Comment key={comment.commentID} comment={comment} />
            ))}
          </div>
          {editCommentID ? (
            <>
              <Form.Control
                as="textarea"
                style={{ height: "100px" }}
                rows={2}
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                className="mb-2"
              />

              <div className="d-flex justify-content-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="me-5"
                  onClick={() => setEditCommentID(null)}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleSaveEditComment}
                  className="position-absolute py-2 d-flex align-items-center justify-content-center border-0"
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#ffff",
                    right: "10px",
                    bottom: "10px",
                    color: "var(--primary)",
                  }}
                >
                  <i className="bx bxs-send bx-sm"></i>
                </button>
              </div>
            </>
          ) : (
            <FloatingLabel
              controlId="newCommentTextarea"
              label="Comment"
              className="mt-3 position-relative"
            >
              <Form.Control
                as="textarea"
                placeholder="Leave a comment here"
                style={{ height: "100px" }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <div className="d-flex justify-content-end mt-2">
                <button
                  onClick={handleSendComment}
                  className="position-absolute py-2 d-flex align-items-center justify-content-center border-0"
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#ffff",
                    right: "10px",
                    bottom: "10px",
                    color: "var(--primary)",
                  }}
                >
                  <i className="bx bxs-send bx-sm"></i>
                </button>
              </div>
            </FloatingLabel>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommentSection;
