import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import AnonymousIcon from "../../../assets/anonymous.png";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import ReportButton from "./ReportCommentButton";
import Suspend from "../Profile/Suspend";
import MessageModal from "../DiaryEntry/messageModal";
import MessageAlert from "../DiaryEntry/messageAlert";

const CommentSection = ({
  userID,
  entryID,
  entry,
  firstName,
  commentCount,
  isAnon,
  alias,
}) => {
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState([]);

  const [editComment, setEditComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

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
    // setLoading(true);
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/fetchComments/${entryID}`
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

    setIsSendingComment(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/comments`,
        newCommentObj
      );
      setNewComment("");
      fetchComments();
      updateEngagement(entryID);
      setTimeout(() => {
        newCommentRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error posting comment:", error);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsSendingComment(false);
    }

    if (userID !== entry) {
      axios
        .post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/notifications/${entry}`,
          {
            userID: entry,
            actorID: userID,
            entryID,
            profile_image: user.profile_image,
            type: "comment",
            message: `${user.firstName} ${user.lastName} commented on your diary entry.`,
          }
        )
        .catch((err) => {
          console.error("Error sending comment notification:", err);
          setError("Failed to send notification.");
        });
    }
  };

  const handleReplyTextChange = (commentID, value) => {
    replyTextsRef.current[commentID] = value;
    // console.log("reply content: ", replyTextsRef.current[commentID]);
  };

  const handleSendReply = async (parentID, repliedUserID) => {
    const replyText = replyTextsRef.current[parentID] || "";
    console.log("reply content: ", replyText);

    if (replyText.trim() === "") return;

    const newReplyObj = {
      userID,
      entryID,
      text: replyText,
      replyCommentID: parentID,
      repliedUserID,
    };

    setIsSendingReply(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/comments`,
        newReplyObj
      );

      if (repliedUserID !== userID) {
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/notifications/${repliedUserID}`,
          {
            userID: repliedUserID,
            actorID: userID,
            entryID,
            profile_image: user.profile_image,
            type: "comment",
            message: `${user.firstName} ${user.lastName} commented on your diary entry.`,
          }
        );
      }

      setReplyTo(null);
      replyTextsRef.current[parentID] = "";
      fetchComments();
      updateEngagement(entryID);
      setOpenAccordions((prevOpen) => [...prevOpen, parentID]);
      setTimeout(() => {
        newReplyRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error posting reply:", error);
      setError("Failed to post reply. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleEditComment = useCallback((comment) => {
    setEditComment(comment.commentID);
    setEditCommentText(comment.text);
  }, []);

  const handleSaveEditComment = useCallback(async () => {
    if (!editCommentText.trim()) return; // Ensure non-empty edit text
    setLoading(true);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/editComment/${editComment}`,
        {
          text: editCommentText,
        }
      );
      setEditComment(null);
      setEditCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Failed to edit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [editComment, editCommentText, fetchComments]);

  const handleDeleteComment = async (commentID) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to delete this comment?`,
      onConfirm: async () => {
        try {
          await axios.delete(
            `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/deleteComment/${commentID}`
          );
          fetchComments();
          closeConfirmModal();
          setModal({
            show: true,
            message: `Comment Deleted.`,
          });
        } catch (error) {
          console.error("Error deleting comment:", error);
          setError("Failed to delete comment. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
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

  const updateEngagement = async (entryID) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/updateEngagement`,
        { entryID }
      );
    } catch (error) {
      console.error("Error updating engagement:", error);
    }
  };

  const Comment = React.memo(({ comment, depth = 0 }) => {
    const canManage = comment.userID === userID;
    const isAccordionOpen = openAccordions.includes(comment.commentID);
    const ownComment = entry === comment.userID;

    return (
      <div
        className="position-relative"
        style={{ marginLeft: "1rem", marginTop: "10px" }}
        ref={comment.commentID === replyTo ? newReplyRef : null}
      >
        {comment.replies.length > 0 ? (
          <>
            <div
              className="position-absolute border-start border-2 mt-2"
              style={{ height: "69%", width: "5%", left: "20px", zIndex: "1" }}
            ></div>
          </>
        ) : null}

        {/* Profile */}
        <div className="d-flex align-items-start flex-column gap-2 pb-2">
          <div className="w-100 d-flex align-items-center justify-content-between pe-3">
            {isAnon === "private" && ownComment ? (
              <div className="d-flex align-items-center gap-2">
                <div
                  className="profilePicture d-flex align-items-center justify-content-center"
                  style={{ zIndex: "2" }}
                >
                  <img
                    src={AnonymousIcon}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-start flex-column">
                  <p className="m-0 text-start">{alias}</p>
                </div>
              </div>
            ) : (
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
                          ? comment.profile_image
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
                    <p className="m-0 text-start">
                      {comment.firstName} {comment.lastName}{" "}
                      {user.isAdmin ? <>({comment.DepartmentName})</> : null}
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {/* FOR COMMENT OPTIONS */}
            <div>
              <Dropdown>
                <Dropdown.Toggle
                  className="btn-light d-flex align-items-center pt-0 pb-2"
                  id="dropdown-basic"
                  bsPrefix="custom-toggle"
                  disabled={comment.isAdmin}
                >
                  <h5 className="m-0">...</h5>
                </Dropdown.Toggle>

                <Dropdown.Menu className="p-2 ">
                  {!canManage &&
                    (user.isAdmin ? (
                      <>
                        <Suspend profileOwner={comment} />
                        {/* <Hide type={"comment"} entry={entry} /> */}
                      </>
                    ) : (
                      <Dropdown.Item className="p-0 btn btn-light">
                        <ReportButton
                          ownComment={ownComment}
                          isAnon={isAnon}
                          alias={alias}
                          commentID={comment.commentID}
                          userID={comment.userID}
                          firstName={comment.firstName}
                          entryID={entryID}
                        />
                      </Dropdown.Item>
                    ))}

                  {canManage && (
                    <>
                      <Dropdown.Item className="p-0 btn btn-light ">
                        <button
                          className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                          onClick={() => handleEditComment(comment)}
                        >
                          <p className="m-0">Edit</p>
                          <i className="bx bxs-edit m-0 ms-1"></i>
                        </button>
                      </Dropdown.Item>
                      <Dropdown.Item className="p-0 btn btn-light ">
                        <button
                          className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                          onClick={() => handleDeleteComment(comment.commentID)}
                        >
                          <p className="m-0">Delete</p>
                          <i className="bx bx-message-square-x m-0 ms-1"></i>
                        </button>
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        <div style={{ zIndex: "10" }}>
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
            <h6
              className="m-0"
              style={{ fontSize: "clamp(.5rem, 9dvw, .7rem)", color: "gray" }}
            >
              {formatDate(comment.created_at)}
            </h6>
          </div>

          <div className="ps-5 d-flex align-items-center gap-2">
            {/* <button className="btn btn-light btn-sm ">Gadify</button> */}
            <button
              className="btn btn-sm"
              onClick={() => setReplyTo(comment.commentID)}
            >
              <p className="m-0">Reply</p>
            </button>
          </div>

          {editComment === comment.commentID ? (
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
                    handleSendReply(comment.commentID, comment.userID);
                  }
                }}
              />
              <div
                className="d-flex justify-content-end mt-2 position-absolute gap-1 gap-md-2"
                style={{ right: "10px", bottom: "10px" }}
              >
                <button
                  className="py-2 d-flex align-items-center justify-content-center border-0"
                  onClick={() => setReplyTo(null)}
                  style={{
                    height: "30px",
                    width: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#ffff",
                    right: "10px",
                    bottom: "10px",
                    color: "red",
                    // fontSize: "clamp(1.2rem, 5dvw, 2rem)",
                  }}
                >
                  <h3 className="m-0 d-flex align-items-center justify-content-center">
                    <i className="bx bx-x"></i>
                  </h3>
                </button>
                <button
                  onClick={() =>
                    handleSendReply(comment.commentID, comment.userID)
                  }
                  className="py-2 d-flex align-items-center justify-content-center border-0"
                  style={{
                    height: "30px",
                    width: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#ffff",
                    color: "var(--primary)",
                  }}
                >
                  <h4 className="m-0 d-flex align-items-center justify-content-center">
                    {isSendingReply ? (
                      <>
                        <i className="bx bx-spin bx-loader-circle"></i>
                      </>
                    ) : (
                      <>
                        <i className="bx bxs-send"></i>
                      </>
                    )}
                  </h4>
                </button>
              </div>
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
              <Accordion.Header className="position-relative">
                {isAccordionOpen ? null : (
                  <div
                    className="position-absolute border-bottom border-start rounded-bottom-3 border-2 mt-2 "
                    style={{
                      height: "4rem",
                      width: "5rem",
                      top: "-45px",
                      left: "-4px",
                      zIndex: "0",
                    }}
                  ></div>
                )}

                <p className="m-0 bg-white" style={{ zIndex: "1" }}>
                  View Replies ({comment.replies.length})
                </p>
              </Accordion.Header>
              <Accordion.Body className="pt-0">
                {/* REPLIES */}
                {comment.replies.map((reply) => (
                  <>
                    <div className="d-flex align-items-start flex-column gap-2 mt-2 position-relative">
                      <div
                        className="position-absolute border-bottom border-start rounded-bottom-3 border-2 mt-2"
                        style={{
                          height: "6.6rem",
                          width: "3rem",
                          top: "-85px",
                          left: "-24px",
                          zIndex: "1",
                        }}
                      ></div>
                      <div className="w-100 d-flex align-items-center justify-content-between pe-3">
                        {isAnon === "private" && ownComment ? (
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="profilePicture d-flex align-items-center justify-content-center"
                              style={{ zIndex: "2" }}
                            >
                              <img
                                src={AnonymousIcon}
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <div className="d-flex justify-content-start flex-column">
                              <p className="m-0 text-start">{alias}</p>
                            </div>
                          </div>
                        ) : (
                          <Link
                            to={`/Profile/${reply.userID}`}
                            className="linkText rounded"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="profilePicture d-flex align-items-center justify-content-center"
                                style={{ zIndex: "2" }}
                              >
                                <img
                                  src={
                                    reply.profile_image
                                      ? reply.profile_image
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
                                <p className="m-0 text-start">
                                  {reply.firstName} {reply.lastName}{" "}
                                  {user.isAdmin ? (
                                    <>({reply.DepartmentName})</>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}
                        {/* FOR COMMENT OPTIONS */}
                        <div>
                          <Dropdown>
                            <Dropdown.Toggle
                              className="btn-light d-flex align-items-center pt-0 pb-2"
                              id="dropdown-basic"
                              bsPrefix="custom-toggle"
                              disabled={reply.isAdmin}
                            >
                              <h5 className="m-0">...</h5>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="p-2 ">
                              {!canManage &&
                                (user.isAdmin ? (
                                  <>
                                    <Suspend profileOwner={reply} />
                                    {/* <Hide type={"comment"} entry={entry} /> */}
                                  </>
                                ) : (
                                  <Dropdown.Item className="p-0 btn btn-light">
                                    <ReportButton
                                      ownComment={ownComment}
                                      isAnon={isAnon}
                                      alias={alias}
                                      commentID={reply.commentID}
                                      userID={reply.userID}
                                      firstName={reply.firstName}
                                      entryID={entryID}
                                    />
                                  </Dropdown.Item>
                                ))}

                              {canManage && (
                                <>
                                  <Dropdown.Item className="p-0 btn btn-light ">
                                    <button
                                      className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                                      onClick={() => handleEditComment(reply)}
                                    >
                                      <p className="m-0">Edit</p>
                                      <i className="bx bxs-edit m-0 ms-1"></i>
                                    </button>
                                  </Dropdown.Item>
                                  <Dropdown.Item className="p-0 btn btn-light ">
                                    <button
                                      className="btn btn-light w-100 d-flex align-items-center justify-content-center"
                                      onClick={() =>
                                        handleDeleteComment(reply.commentID)
                                      }
                                    >
                                      <p className="m-0">Delete</p>
                                      <i className="bx bx-message-square-x m-0 ms-1"></i>
                                    </button>
                                  </Dropdown.Item>
                                </>
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
                            reply.commentID ===
                            reply[reply.length - 1]?.commentID
                              ? newCommentRef
                              : null
                          }
                        >
                          {reply.text}
                        </p>
                        <h6
                          className="m-0"
                          style={{
                            fontSize: "clamp(.5rem, 9dvw, .7rem)",
                            color: "gray",
                          }}
                        >
                          {formatDate(reply.created_at)}
                        </h6>
                      </div>

                      {editComment === reply.commentID ? (
                        <div className="mb-2 w-100"></div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </>
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
        <span>{commentCount}</span>
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
              Comments on {isAnon === "private" ? alias : firstName}'s Diary
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex flex-column justify-content-between p-1 p-sm-3"
          style={{ height: "clamp(30rem ,40dvw ,35rem)" }}
        >
          <div
            className="pe-2 custom-scrollbar"
            style={{ overflowY: "scroll", height: "100%" }}
          >
            {loading ? (
              <>
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{ height: "90%" }}
                >
                  <h4 className="m-0">
                    <i className="bx bx-loader bx-spin"></i>
                  </h4>
                  <p className="text-center">Loading comments</p>
                </div>
              </>
            ) : (
              <>
                {comments.length === 0 ? (
                  <>
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: "90%" }}
                    >
                      <p className="text-center text-secondary">
                        No comments yet. Be the first to share your thoughts.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <Comment key={comment.commentID} comment={comment} />
                    ))}
                  </>
                )}
              </>
            )}
            {/* {error && <p className="text-danger">{error}</p>} */}
          </div>
          <FloatingLabel
            controlId="newCommentTextarea"
            label={editComment ? "Edit Comment" : "Comment"}
            className="commentInput mt-3 position-relative"
          >
            <Form.Control
              as="textarea"
              className="pe-5"
              placeholder="Leave a comment here"
              style={{ height: "clamp(4rem, 10dvw, 6rem)" }}
              value={editComment ? editCommentText : newComment}
              onChange={(e) => {
                if (editComment) {
                  setEditCommentText(e.target.value); // Update the text for editing
                } else {
                  setNewComment(e.target.value); // Update the new comment
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  {
                    editComment ? handleSaveEditComment() : handleSendComment();
                  }
                }
              }}
            />
            <div
              className="d-flex justify-content-end mt-2 position-absolute gap-1 gap-md-2"
              style={{ right: "10px", bottom: "10px" }}
            >
              {editComment ? (
                <button
                  className="py-2 d-flex align-items-center justify-content-center border-0"
                  onClick={() => setEditComment(null)}
                  style={{
                    height: "30px",
                    width: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#ffff",
                    right: "10px",
                    bottom: "10px",
                    color: "red",
                    fontSize: "clamp(1.2rem, 5dvw, 2rem)",
                  }}
                >
                  <h3 className="m-0 d-flex align-items-center justify-content-center">
                    <i className="bx bx-x"></i>
                  </h3>
                </button>
              ) : (
                ""
              )}

              <button
                onClick={
                  editComment ? handleSaveEditComment : handleSendComment
                }
                className="py-2 d-flex align-items-center justify-content-center border-0"
                style={{
                  height: "30px",
                  width: "30px",
                  borderRadius: "50%",
                  backgroundColor: "#ffff",
                  color: "var(--primary)",
                  fontSize: "clamp(1.2rem, 5dvw, 1.5rem)",
                }}
              >
                <h4 className="m-0 d-flex align-items-center justify-content-center">
                  {isSendingComment ? (
                    <>
                      <i className="bx bx-spin bx-loader-circle"></i>
                    </>
                  ) : (
                    <>
                      <i className="bx bxs-send"></i>
                    </>
                  )}
                </h4>
              </button>
            </div>
          </FloatingLabel>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommentSection;
