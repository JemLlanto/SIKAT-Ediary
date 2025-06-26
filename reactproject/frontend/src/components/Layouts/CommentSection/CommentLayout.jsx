import { useState } from "react";
import { Dropdown, Accordion, FloatingLabel, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import AnonymousIcon from "../../../assets/anonymous.png";
import CommentDropdown from "./CommentDropdown";
import Swal from "sweetalert2";

const CommentLayout = ({
  entryData,
  fetchComments,
  comment,
  comments,
  userID,
  openAccordions,
  entry,
  entryID,
  replyTo,
  setReplyTo,
  isAnon,
  user,
  editComment,
  newCommentRef,
  toggleAccordion,
  isSendingReply,
  handleSendReply,
  handleReplyTextChange,
  count,
  setCount,
  setEditComment,
  setEditCommentText,
}) => {
  const canManage = comment.userID === userID;
  const isAccordionOpen = openAccordions.includes(comment.commentID);
  const ownComment = entry === comment.userID;
  const [userToReply, setUserToReply] = useState("");
  const [deletedComment, setDeletedComment] = useState(null);
  const [isHidden, setIsHidden] = useState(null);

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

  const handleDeleteComment = async (commentID) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // setLoading(true);
        await axios.delete(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/deleteComment/${commentID}`
        );
        setDeletedComment(commentID);
        setCount(count - 1);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Comment has been deleted.",
        });
      } catch (error) {
        console.error("Error deleting comment:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete comment. Please try again.",
        });
      } finally {
        // setLoading(false);
      }
    }
  };
  return (
    <div
      className="position-relative mb-3"
      style={{ marginLeft: "1rem", marginTop: "10px" }}
      //   ref={comment.commentID === replyTo ? newReplyRef : null}
    >
      {comment.replies.length > 0 ? (
        <>
          <div
            className="position-absolute border-start border-2 mt-2"
            style={{ height: "69%", width: "5%", left: "27px", zIndex: "1" }}
          ></div>
        </>
      ) : null}

      {/* Profile */}
      {deletedComment === comment.commentID ? (
        <>
          <div className="d-flex align-items-start flex-column gap-2 pb-2">
            <div className="w-100 d-flex align-items-center justify-content-between pe-3">
              {isAnon === "private" && ownComment ? (
                // IF USER IS ANONIMOUS
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
                    <p className="m-0 text-start">{entryData.alias}</p>
                  </div>
                </div>
              ) : (
                <>
                  {comment.isAnon ? (
                    <div className="linkText rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="profilePicture d-flex align-items-center justify-content-center"
                          style={{ zIndex: "2" }}
                        >
                          <img
                            src={AnonymousIcon}
                            alt="Anonymous Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="d-flex justify-content-start flex-column">
                          <p className="m-0 text-start">{comment.alias}</p>
                        </div>
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
                            src={comment.profile_image}
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
                            {!comment.isAdmin && user.isAdmin ? (
                              <>({comment.DepartmentName})</>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </>
              )}
              {/* FOR COMMENT OPTIONS */}
            </div>
          </div>

          <div style={{ zIndex: "100" }}>
            <div className="ps-5 ms-2 d-flex align-items-center gap-2">
              <p
                className="m-0 p-2 rounded border-2 text-secondary d-flex flex-column"
                style={{
                  whiteSpace: "pre-wrap",
                  maxWidth: "500px",
                  minWidth: "7rem",
                  wordWrap: "break-word",
                  backgroundColor: "var(--background_light)",
                }}
                ref={
                  comment.commentID === comments[comments.length - 1]?.commentID
                    ? newCommentRef
                    : null
                }
              >
                This comment has been deleted.
              </p>
            </div>

            <div className="ps-5 d-flex align-items-center gap-2 position-relative">
              {/* <button className="btn btn-light btn-sm ">Gadify</button> */}
              <button
                className="btn btn-light btn-sm position-absolute"
                onClick={() => {
                  setReplyTo(comment.commentID),
                    setUserToReply(comment.firstName);
                }}
                disabled={replyTo === comment.commentID}
                style={{ zIndex: "999", left: "3.5rem", top: ".3rem" }}
              >
                <p className="m-0">Reply</p>
              </button>
              <button className="btn btn-sm py-2"></button>
            </div>

            {editComment === comment.commentID ? (
              <div className="mb-2 w-100"></div>
            ) : (
              <div></div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="d-flex align-items-start flex-column gap-2 pb-2">
            <div className="w-100 d-flex align-items-center justify-content-between pe-3">
              {isAnon === "private" && ownComment ? (
                // IF USER IS ANONIMOUS
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
                    <p className="m-0 text-start">{entryData.alias}</p>
                  </div>
                </div>
              ) : (
                <>
                  {comment.isAnon ? (
                    <div className="linkText rounded">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="profilePicture d-flex align-items-center justify-content-center"
                          style={{ zIndex: "2" }}
                        >
                          <img
                            src={AnonymousIcon}
                            alt="Anonymous Profile"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="d-flex justify-content-start flex-column">
                          <p className="m-0 text-start">{comment.alias}</p>
                        </div>
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
                            src={comment.profile_image}
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
                            {!comment.isAdmin && user.isAdmin ? (
                              <>({comment.DepartmentName})</>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </>
              )}
              {/* FOR COMMENT OPTIONS */}
              <div>
                <CommentDropdown
                  fetchComments={fetchComments}
                  comment={comment}
                  entryData={entryData}
                  user={user}
                  canManage={canManage}
                  handleDeleteComment={handleDeleteComment}
                  setEditComment={setEditComment}
                  setEditCommentText={setEditCommentText}
                  setIsHidden={setIsHidden}
                />
              </div>
            </div>
          </div>

          <div style={{ zIndex: "100" }}>
            <div className="ps-5 ms-2 d-flex align-items-center gap-2">
              <p
                className="m-0 p-2 rounded border-2 text-secondary d-flex flex-column"
                style={{
                  whiteSpace: "pre-wrap",
                  maxWidth: "500px",
                  minWidth: "7rem",
                  wordWrap: "break-word",
                  backgroundColor: "var(--background_light)",
                }}
                ref={
                  comment.commentID === comments[comments.length - 1]?.commentID
                    ? newCommentRef
                    : null
                }
              >
                {user.isAdmin ? (
                  <>
                    {comment.isReported && !comment.isReviewed ? (
                      <span className="text-danger">
                        This comment is reported.
                      </span>
                    ) : null}
                    {comment.isReported && comment.isReviewed ? (
                      <span className="text-primary">
                        This comment is reviewed.
                      </span>
                    ) : null}
                  </>
                ) : null}
                {isHidden === comment.commentID || comment.isHidden ? (
                  <>
                    {user.userID === comment.userID ? "Your" : "This"} comment
                    has been hidden by the admin/s.
                  </>
                ) : (
                  <> {comment.text}</>
                )}

                <span
                  className="m-0 text-start mt-2"
                  style={{
                    fontSize: "clamp(.5rem, 9dvw, .7rem)",
                    color: "#b3b3b3",
                  }}
                >
                  {formatDate(comment.created_at)}
                </span>
              </p>
            </div>

            <div className="ps-5 d-flex align-items-center gap-2 position-relative">
              {/* <button className="btn btn-light btn-sm ">Gadify</button> */}
              <button
                className="btn btn-light btn-sm position-absolute"
                onClick={() => {
                  setReplyTo(comment.commentID),
                    setUserToReply(comment.firstName);
                }}
                disabled={
                  (replyTo === comment.commentID,
                  isHidden === comment.commentID || comment.isHidden)
                }
                style={{ zIndex: "999", left: "3.5rem", top: ".3rem" }}
              >
                <p className="m-0">Reply</p>
              </button>
              <button className="btn btn-sm py-2"></button>
            </div>

            {editComment === comment.commentID ? (
              <div className="mb-2 w-100"></div>
            ) : (
              <div></div>
            )}
          </div>
        </>
      )}

      {replyTo === comment.commentID && (
        <div className="ps-5 pe-3 mt-4">
          <FloatingLabel
            controlId={`replyTextarea-${comment.commentID}`}
            label={`Reply to ${userToReply}`}
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
          <Accordion.Item
            className="position-relative"
            eventKey={`reply-${comment.commentID}`}
          >
            <Accordion.Header>
              <p className="m-0 bg-white" style={{ zIndex: "1" }}>
                View Replies ({comment.replies.length})
              </p>
            </Accordion.Header>
            {isAccordionOpen ? null : (
              <div
                className="position-absolute border-bottom border-start rounded-bottom-3 border-2 mt-2"
                style={{
                  height: "8rem",
                  width: "5rem",
                  top: "-110px",
                  left: "3px",
                  zIndex: "0",
                }}
              ></div>
            )}

            <Accordion.Body className="pt-0">
              {/* REPLIES */}
              {comment.replies.map((reply) => (
                <>
                  <div className="d-flex align-items-start flex-column gap-2 mt-2 position-relative">
                    <div
                      className="position-absolute border-bottom border-start rounded-bottom-3 border-2 mt-2"
                      style={{
                        height: "7.6rem",
                        width: "3rem",
                        top: "-100px",
                        left: "-17px",
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
                            <p className="m-0 text-start">{entryData.alias}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {reply.isAnon ? (
                            <div className="linkText rounded">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="profilePicture d-flex align-items-center justify-content-center"
                                  style={{ zIndex: "2" }}
                                >
                                  <img
                                    src={AnonymousIcon}
                                    alt="Anonymous Profile"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                                <div className="d-flex justify-content-start flex-column">
                                  <p className="m-0 text-start">
                                    {reply.alias}
                                  </p>
                                </div>
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
                                    src={reply.profile_image}
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
                                    {!reply.isAdmin && user.isAdmin ? (
                                      <>({reply.DepartmentName})</>
                                    ) : null}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                      {/* FOR COMMENT OPTIONS */}
                      <div>
                        <CommentDropdown
                          fetchComments={fetchComments}
                          comment={reply}
                          entryData={entryData}
                          user={user}
                          canManage={canManage}
                          handleDeleteComment={handleDeleteComment}
                          setEditComment={setEditComment}
                          setEditCommentText={setEditCommentText}
                          setIsHidden={setIsHidden}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ps-5 ms-2 d-flex align-items-center gap-2">
                      <p
                        className="m-0 p-2 rounded border-2 text-secondary d-flex flex-column"
                        style={{
                          whiteSpace: "pre-wrap",
                          maxWidth: "500px",
                          minWidth: "7rem",
                          wordWrap: "break-word",
                          backgroundColor: "var(--background_light)",
                        }}
                        ref={
                          reply.commentID ===
                          comment.replies[comment.replies.length - 1]?.commentID
                            ? newCommentRef
                            : null
                        }
                      >
                        {user.isAdmin ? (
                          <>
                            {reply.isReported && !reply.isReviewed ? (
                              <span className="text-danger">
                                This comment is reported.
                              </span>
                            ) : null}
                            {reply.isReported && reply.isReviewed ? (
                              <span className="text-primary">
                                This comment is reviewed.
                              </span>
                            ) : null}
                          </>
                        ) : null}
                        {isHidden === reply.commentID || reply.isHidden ? (
                          <>
                            {user.userID === reply.userID ? "Your" : "This"}{" "}
                            comment has been hidden by the admin/s.
                          </>
                        ) : (
                          <>{reply.text}</>
                        )}

                        <span
                          className="m-0 text-start mt-2"
                          style={{
                            fontSize: "clamp(.5rem, 9dvw, .7rem)",
                            color: "#b3b3b3",
                          }}
                        >
                          {formatDate(reply.created_at)}
                        </span>
                      </p>
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
};

export default CommentLayout;
