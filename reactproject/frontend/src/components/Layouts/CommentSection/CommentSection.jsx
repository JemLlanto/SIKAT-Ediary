import { useState, useEffect, useCallback, useRef, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import DropDownButton from "../../../assets/DropDown.png";
import AnonymousIcon from "../../../assets/anonymous.png";
import DefaultProfile from "../../../assets/userDefaultProfile.png";
import React from "react";
import { Dropdown, ToggleButton } from "react-bootstrap";
import Suspend from "../Profile/Suspend";
import MessageModal from "../DiaryEntry/messageModal";
import MessageAlert from "../DiaryEntry/messageAlert";
import CommentLayout from "./CommentLayout";
import Swal from "sweetalert2";

const CommentSection = ({
  user,
  entryData,
  userID,
  entryID,
  entry,
  firstName,
  commentCount,
  isAnon,
  alias,
}) => {
  const [show, setShow] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState([]);
  const [count, setCount] = useState(0);
  const [editComment, setEditComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [interactAsAnon, setInteractAsAnon] = useState(
    isAnon === "private"
      ? true
      : () => {
          const storedValue = localStorage.getItem("interactAsAnon");
          return storedValue ? JSON.parse(storedValue) : false;
        }
  );
  const [hasCommented, setHasCommented] = useState(false);
  const replyTextsRef = useRef({});
  const newCommentRef = useRef(null);
  useEffect(() => {
    if (newCommentRef.current) {
      // console.log("Ref", newCommentRef.current);
      newCommentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [comments]); // runs every time a new comment is added
  // const newReplyRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
    } else {
      window.location.href = "/";
    }
    if (!commentCount) return;
    setCount(commentCount);
  }, [commentCount]);

  const toggleAnon = () => {
    setInteractAsAnon((prev) => {
      const newValue = !prev;

      // Save to localStorage
      localStorage.setItem("interactAsAnon", JSON.stringify(newValue));

      // Show SweetAlert message
      Swal.fire({
        icon: "info",
        title: "Notice",
        text: newValue
          ? "You're now interacting anonymously"
          : "You're no longer interacting anonymously",
        // toast: true,
        // position: "top-end",
        timer: 5000,
        showConfirmButton: false,
      });

      return newValue;
    });
  };

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

      // Check if the user has commented
      const hasUserCommented = fetchedComments.some(
        (comment) => comment.userID === user?.userID
      );
      // console.log(
      //   hasUserCommented
      //     ? "User alreeady commented"
      //     : "No comment for the current user"
      // );
      setHasCommented(hasUserCommented);
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
      isAnon: interactAsAnon,
    };

    setIsSendingComment(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/comments`,
        newCommentObj
      );
      setNewComment("");
      fetchComments();
      setCount(count + 1);
      updateEngagement(entryID);
      // setTimeout(() => {
      //   newCommentRef.current?.scrollIntoView({
      //     behavior: "smooth",
      //     block: "end",
      //   });
      // }, 100);
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
    // console.log("reply content: ", replyText);

    if (replyText.trim() === "") return;

    const newReplyObj = {
      userID,
      entryID,
      text: replyText,
      isAnon: interactAsAnon,
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
      setCount(count + 1);
      updateEngagement(entryID);
      setOpenAccordions((prevOpen) => [...prevOpen, parentID]);
      // setTimeout(() => {
      //   newReplyRef.current?.scrollIntoView({ behavior: "smooth" });
      // }, 100);
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
    setIsSendingComment(true);
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
      setIsSendingComment(false);
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

  const Comment = React.memo(({ comment, depth = 0 }) => {});

  return (
    <>
      <button
        className="InteractButton d-flex align-items-center justify-content-center gap-2"
        onClick={handleShow}
      >
        <i className="bx bx-comment"></i>
        <span>{count}</span>
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
              Comments on{" "}
              {isAnon === "private"
                ? user.userID === entryData.userID
                  ? "your"
                  : `${alias}'s`
                : user.userID === entryData.userID
                ? "your"
                : `${firstName}'s`}
              {entryData.isAdmin ? " post" : " diary"}
            </h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="d-flex flex-column justify-content-between p-0"
          style={{ height: "clamp(30rem ,40dvw ,35rem)" }}
        >
          <div
            className="custom-scrollbar"
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
                      <CommentLayout
                        key={comment.commentID}
                        entryData={entryData}
                        comment={comment}
                        comments={comments}
                        userID={userID}
                        openAccordions={openAccordions}
                        entry={entry}
                        entryID={entryID}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                        isAnon={isAnon}
                        user={user}
                        editComment={editComment}
                        newCommentRef={newCommentRef}
                        toggleAccordion={toggleAccordion}
                        isSendingReply={isSendingReply}
                        handleSendReply={handleSendReply}
                        handleReplyTextChange={handleReplyTextChange}
                        handleEditComment={handleEditComment}
                      />
                    ))}
                  </>
                )}
              </>
            )}
            {/* {error && <p className="text-danger">{error}</p>} */}
          </div>
          <div className="w-100 row m-0 px-2">
            <div className="col p-0">
              <FloatingLabel
                controlId="newCommentTextarea"
                label={
                  editComment ? (
                    "Edit Comment"
                  ) : interactAsAnon ? (
                    "Comment anonimously"
                  ) : (
                    <>{`Comment as ${user.firstName}`}</>
                  )
                }
                className="commentInput mt-3 position-relative m-2"
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
                        editComment
                          ? handleSaveEditComment()
                          : handleSendComment();
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
            </div>
            <div className="col-2 col-md-1 p-0 d-flex justify-content-center align-items-center">
              <Dropdown>
                <Dropdown.Toggle
                  as="button"
                  className="logo position-relative custom-button d-flex align-items-center justify-content-center overflow-visible p-0"
                  id="UserAccountDropdown"
                  bsPrefix="custom-toggle"
                  disabled={user.userID === entryData.userID || hasCommented}
                >
                  <div
                    className="position-absolute rounded-circle d-flex justify-content-center align-items-center p-0"
                    style={{
                      width: "clamp(15px, 2dvw, 20px)",
                      height: "clamp(15px, 2dvw, 20px)",
                      backgroundColor: "white",
                      right: "-3px",
                      bottom: "-1px",
                      border: "2px solid #ffffff",
                    }}
                  >
                    <img
                      className="mt-1"
                      src={DropDownButton}
                      alt=""
                      style={{ width: "60%", height: "60%" }}
                    />
                  </div>
                  <div
                    className="overflow-hidden rounded-circle"
                    style={{ width: "100%", height: "100%" }}
                  >
                    {interactAsAnon ? (
                      <>
                        <img
                          src={AnonymousIcon}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <img
                          src={user.profile_image}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </>
                    )}
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-end mt-2 px-2">
                  <Dropdown.Item className="dropdownItem w-100 btn text-end p-0">
                    <div
                      className="w-100 btn"
                      onClick={toggleAnon}
                      style={
                        interactAsAnon
                          ? {
                              backgroundColor: "var(--primary)",
                              color: "#ffffff",
                            }
                          : {
                              backgroundColor: "transparent",
                              color: "var(--primary)",
                              border: "1px solid var(--primary)",
                            }
                      }
                    >
                      <p className="m-0">Anonimous</p>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommentSection;
