import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import anonymous from "../../assets/anonymous.png";
import MainLayout from "../Layouts/MainLayout";
import Dropdown from "react-bootstrap/Dropdown";
// import Modal from "react-bootstrap/Modal";
// import CloseButton from "react-bootstrap/CloseButton";
// import CommentDropdown from "../Layouts/CommentSection/CommentDropdown";
// import DiaryEntryLayout from "../Layouts/Home/DiaryEntryLayout";
import axios from "axios";
// import CommentSectionButton from "../Layouts/CommentSection/CommentSection";
import CommentSection from "../Layouts/DiaryEntry/CommentSection";

import FlagButton from "../Layouts/Home/FlagButton";
import ChatButton from "../Layouts/DiaryEntry/ChatButton";
import DiaryDetails from "../Layouts/DiaryEntry/DiaryDetails";
import ImageModal from "../Layouts/DiaryEntry/imageModal";
import FollowButton from "../Layouts/DiaryEntry/FollowButton";
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import EditPostButton from "../Layouts/Home/EditPostButton";
import EditDiaryEntryButton from "../Layouts/Home/EditDiaryEntryButton";
import DeleteButton from "../Layouts/DiaryEntry/DeleteButton";
import Suspend from "../Layouts/Profile/Suspend";
import Reviewed from "../Layouts/Profile/Reviewed";
import Hide from "../Layouts/Profile/Hide";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import BackButton from "../Layouts/Home/BackButton";
// import DiaryOwnerDetails from "../Layouts/DiaryEntry/DiaryOwnerDetails";

const DiaryEntry = () => {
  const { entryID } = useParams();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [comments, setComments] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const commentSectionRef = useRef(null);

  // FOR MESSAGE MODALS
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

  // FOR CLICKABLE IMAGE
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = (entryID) => {
    setShowModal(true);
    // updateEngagement(entryID);
  };
  const handleCloseModal = () => setShowModal(false);

  // Fetch user data and check if logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Fetch the data of the current user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
      return;
    }
    setCurrentUser(storedUser);
  }, [navigate]);

  // Fetch entry and comments when user or entryID changes
  useEffect(() => {
    if (user && entryID) {
      fetchEntry();
      fetchComments();
      fetchFollowedUsers(user.userID);
    }
  }, [user, entryID]);

  const fetchEntry = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchDiaryEntry/${entryID}`
      );
      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${user.userID}`
      );

      if (response.data && response.data.entry) {
        const entry = response.data.entry;
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        setEntries([{ ...entry, isGadified }]);
      } else {
        setError("No entry found.");
      }
    } catch (error) {
      console.error("Error fetching entry:", error);
      setError("Error loading entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchComments/${entryID}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments.");
    }
  };

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const handleGadify = async (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(`http://localhost:8081/entry/${entryID}/gadify`, {
        userID: user.userID,
      })
      .then((res) => {
        const isGadified =
          res.data.message === "Gadify action recorded successfully";

        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.entryID === entryID
              ? {
                  ...entry,
                  gadifyCount: isGadified
                    ? entry.gadifyCount + 1
                    : entry.gadifyCount - 1,
                }
              : entry
          )
        );

        if (isGadified && user.userID !== entry.userID) {
          axios
            .post(`http://localhost:8081/notifications/${entry.userID}`, {
              actorID: user.userID,
              entryID: entryID,
              profile_image: user.profile_image,
              type: "gadify",
              message: `${user.firstName} ${user.lastName} gadified your diary entry.`,
            })
            .then((res) => {
              console.log("Notification response:", res.data);
            })
            .catch((err) => {
              console.error("Error sending gadify notification:", err);
            });
        }
      })
      .catch((err) => console.error("Error updating gadify count:", err));
  };

  const handleClick = (entryID) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.entryID === entryID
          ? { ...entry, isGadified: !entry.isGadified }
          : entry
      )
    );
    setExpandButtons((prev) => ({ ...prev, [entryID]: true }));
    setTimeout(
      () => setExpandButtons((prev) => ({ ...prev, [entryID]: false })),
      300
    );
    handleGadify(entryID);
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    return timeDiff < 24 * 60 * 60 * 1000
      ? entryDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : entryDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
  };

  // FOR FLAGGED AND COMMENT COUNT
  const commentCount = comments.length;

  const [flaggedCount, setFlaggedCount] = useState(null);

  useEffect(() => {
    if (entries.length > 0) {
      const entry = entries[0]; // Assuming there's only one entry per page
      const fetchFlaggedCount = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/flaggedCount/${entry.entryID}`
          );
          setFlaggedCount(response.data.flaggedCount);
        } catch (error) {
          console.error("Error fetching flagged count:", error);
        }
      };
      fetchFlaggedCount();
    }
  }, [entries]);

  const handleFollowToggle = async (followUserId, targetUsername) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      alert("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        setConfirmModal({
          show: true,
          message: `Are you sure you want to unfollow ${targetUsername}?`,
          onConfirm: async () => {
            try {
              await axios.delete(
                `http://localhost:8081/unfollow/${followUserId}`,
                {
                  data: { followerId: user.userID },
                }
              );

              // Update followed users list after unfollowing
              setFollowedUsers((prev) =>
                prev.filter((id) => id !== followUserId)
              );

              // Close confirmation modal and show success modal
              setConfirmModal({ show: false, message: "" });
              setModal({
                show: true,
                message: `You have unfollowed ${targetUsername}.`,
              });

              // Refresh the followed users list from the backend
              await fetchFollowedUsers(user.userID);
            } catch (error) {
              console.error("Error unfollowing user:", error);
              setModal({
                show: true,
                message: `There was an error unfollowing ${targetUsername}.`,
              });
            }
          },
          onCancel: () => setConfirmModal({ show: false, message: "" }),
        });
      } else {
        await axios.post(`http://localhost:8081/follow/${followUserId}`, {
          followerId: user.userID,
        });

        // Update followed users list after following
        setFollowedUsers((prev) => [...prev, followUserId]);

        // Show success modal
        setModal({
          show: true,
          message: `You are now following ${targetUsername}.`,
        });

        // Send follow notification to the followed user
        await axios.post(
          `http://localhost:8081/notifications/${followUserId}`,
          {
            userID: followUserId,
            actorID: user.userID,
            entryID: null,
            profile_image: user.profile_image,
            type: "follow",
            message: `${user.firstName} ${user.lastName} has followed you.`,
          }
        );

        // Refresh the followed users list from the backend
        await fetchFollowedUsers(user.userID);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request.`,
      });
    }
  };

  // FOR COMMENT BUTTON
  const commentButtonInput = useRef(null);
  const focusCommentInput = () => {
    commentButtonInput.current?.focusCommentInput();
  };

  return (
    <MainLayout>
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
      <div
        className="d-flex align-items-center justify-content-center pb-3"
        style={{ minHeight: "70vh" }}
      >
        <BackButton></BackButton>
        {isLoading ? (
          <p>Loading...</p>
        ) : entries.length === 0 ? (
          <p>{error || "No entries available."}</p>
        ) : (
          entries.map((entry) => {
            const ownDiary = currentUser?.userID === entry.userID;
            return (
              <div
                className="d-flex justify-content-center align-items-center mt-3 bg-light rounded shadow-sm p-3"
                style={{ width: "clamp(30rem, 90vw, auto)" }}
              >
                <div
                  className="row d-flex justify-content-center gap-3"
                  style={{
                    width: entry.diary_image
                      ? "clamp(19rem, 80dvw, 90rem)"
                      : "clamp(19rem, 85dvw, 40rem)",
                  }}
                >
                  {entry.diary_image && (
                    // IMAGE SIDE
                    <div className="col-lg-7 d-flex justify-content-center align-items-center overflow-hidden rounded">
                      <div
                        style={{
                          width: "clamp(19rem, 90dvw, 90rem)",
                          height: "clamp(19rem, 80dvw, 80dvh)",
                        }}
                      >
                        <img
                          className="DiaryImage rounded"
                          src={`http://localhost:8081${entry.diary_image}`}
                          alt="Diary"
                          style={{
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }} // Add pointer cursor
                          onClick={() => handleShowModal(entry.entryID)} // Open modal on click
                        />
                      </div>
                      {/* Clickable Image */}
                      {entry.diary_image && (
                        <>
                          {/* Modal */}
                          <ImageModal
                            showModal={showModal}
                            handleCloseModal={handleCloseModal}
                            diaryImage={`http://localhost:8081${entry.diary_image}`}
                          ></ImageModal>
                        </>
                      )}
                    </div>
                  )}

                  {/* DIARY DETAILS SIDE */}
                  <div
                    className="col-lg col-md"
                    style={
                      {
                        // width: entry.diary_image
                        //   ? "clamp(19rem, 30dvw, 30rem)"
                        //   : "clamp(19rem, 50dvw, 50rem)",
                        // height: "clamp(19rem, 50dvw, 80dvh)",
                      }
                    }
                  >
                    <div className="border-bottom d-flex gap-2 pb-2">
                      {/* IF PUBLIC */}
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        {/* TO DETERMINE IF THE DIARY IN ANONYMOUS OR NOT */}
                        {entry.anonimity === "private" ? (
                          <div className="profilePicture">
                            <img
                              src={
                                entry.isAdmin === 1
                                  ? `http://localhost:8081${entry.profile_image}`
                                  : anonymous
                              }
                              alt="Profile"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ) : (
                          <Link
                            to={`/Profile/${entry.userID}`}
                            className="linkText rounded p-0"
                          >
                            <div className="profilePicture">
                              <img
                                src={
                                  entry.profile_image
                                    ? `http://localhost:8081${entry.profile_image}`
                                    : userDefaultProfile
                                }
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          </Link>
                        )}
                        <div className="d-flex flex-column align-items-start">
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            {entry.anonimity === "private" ? (
                              <h5 className="m-0">{entry.alias}</h5>
                            ) : (
                              <Link
                                to={`/Profile/${entry.userID}`}
                                className="linkText rounded p-0"
                              >
                                <h5 className="m-0 text-start">
                                  {entry.isAdmin === 1
                                    ? "Gender and Development"
                                    : entry.firstName && entry.lastName
                                    ? entry.firstName + " " + entry.lastName
                                    : user.firstName + " " + user.lastName}
                                </h5>
                              </Link>
                            )}
                            {user.isAdmin ? (
                              ""
                            ) : (
                              <>
                                {user &&
                                  user.userID !== entry.userID &&
                                  entry.anonimity !== "private" &&
                                  entry.isAdmin !== 1 && (
                                    <div className="d-flex align-items-center gap-1">
                                      <h3
                                        className="m-0 text-secondary d-flex align-items-center"
                                        style={{ height: ".9rem" }}
                                      >
                                        ·
                                      </h3>
                                      <FollowButton
                                        userID={entry.userID}
                                        firstName={entry.firstName}
                                        followedUsers={followedUsers}
                                        handleFollowToggle={handleFollowToggle}
                                      ></FollowButton>
                                      {/* <button
                                        className="secondaryButton p-0 m-0"
                                        onClick={() =>
                                          handleFollowToggle(
                                            entry.userID,
                                            entry.firstName
                                          )
                                        }
                                        style={{ height: "" }}
                                      >
                                        <h5 className="m-0">
                                          {followedUsers.includes(entry.userID)
                                            ? "Following"
                                            : "Follow"}
                                        </h5>{" "}
                                      </button> */}
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                          <p className="m-0" style={{ fontSize: ".7rem" }}>
                            {formatDate(entry.created_at)}{" "}
                            <span>
                              {entry.visibility === "public" ? (
                                <i class="bx bx-globe"></i>
                              ) : (
                                <i class="bx bx-lock-alt"></i>
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        {ownDiary || currentUser.isAdmin ? (
                          <Dropdown>
                            <Dropdown.Toggle
                              className="btn-light d-flex align-items-center pt-0 pb-2"
                              id="dropdown-basic"
                              bsPrefix="custom-toggle"
                            >
                              <h5 className="m-0">...</h5>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="p-2">
                              {user.isAdmin && !entry.isAdmin ? (
                                <>
                                  <Suspend
                                    entryID={entry.entryID}
                                    userID={entry.userID}
                                    firstName={entry.firstName}
                                    suspended={entry.isSuspended}
                                  ></Suspend>
                                  {/* <Reviewed
                                    entry={entry}
                                    entryID={entry.entryID}
                                    userID={entry.userID}
                                    firstName={entry.firstName}
                                    suspended={entry.isSuspended}
                                  ></Reviewed> */}
                                  <Hide
                                    type={"diary"}
                                    entry={entry}
                                    entryID={entry.entryID}
                                  ></Hide>
                                </>
                              ) : (
                                <>
                                  <Dropdown.Item className="p-0 btn btn-light">
                                    {user.isAdmin ? (
                                      <EditPostButton
                                        entry={entry}
                                        entryID={entry.entryID}
                                        diaryTitle={entry.title}
                                        diaryDesc={entry.description}
                                        diaryVisib={entry.visibility}
                                        diaryAnon={entry.anonimity}
                                        diarySub={entry.subjects}
                                        imageFile={
                                          entry.diary_image &&
                                          `http://localhost:8081${entry.diary_image}`
                                        }
                                      ></EditPostButton>
                                    ) : (
                                      <EditDiaryEntryButton
                                        entry={entry}
                                        entryID={entry.entryID}
                                        diaryTitle={entry.title}
                                        diaryDesc={entry.description}
                                        diaryVisib={entry.visibility}
                                        diaryAnon={entry.anonimity}
                                        diarySub={entry.subjects}
                                        imageFile={
                                          entry.diary_image &&
                                          `http://localhost:8081${entry.diary_image}`
                                        }
                                      />
                                    )}
                                  </Dropdown.Item>
                                  {/* <Dropdown.Item className="p-0 btn btn-light">
                                    <DeleteButton
                                      entryID={entry.entryID}
                                      title={entry.title}
                                    ></DeleteButton>
                                  </Dropdown.Item> */}
                                </>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : (
                          <p></p>
                        )}
                      </div>
                    </div>
                    {/* DIARY ENTRY DETAILS */}
                    <div
                      className="text-start border-bottom py-2 pt-2 overflow-y-scroll custom-scrollbar"
                      style={{ height: "18dvh" }}
                    >
                      <DiaryDetails
                        user={user}
                        entry={entry}
                        isAdmin={user.isAdmin}
                        entrySubject={entry.subjects}
                        containAlarmingWords={entry.containsAlarmingWords}
                        title={entry.title}
                        description={entry.description}
                      ></DiaryDetails>
                    </div>
                    <div className="row px-2 pt-2 gap-1">
                      <div className="col p-0">
                        <button
                          className={`InteractButton d-flex align-items-center justify-content-center gap-1 ${
                            entry.isGadified ? "active" : ""
                          } ${expandButtons[entry.entryID] ? "expand" : ""}`}
                          onClick={() => handleClick(entry.entryID)}
                        >
                          {entry.isGadified ? (
                            <i className="bx bxs-heart"></i>
                          ) : (
                            <i className="bx bx-heart"></i>
                          )}
                          <span>{entry.gadifyCount}</span>
                          <p className="m-0 d-none d-md-block">Gadify</p>
                        </button>
                      </div>

                      {entry.diary_image ? (
                        <div className="col p-0">
                          <button
                            className="InteractButton d-flex align-items-center justify-content-center gap-2"
                            onClick={focusCommentInput}
                          >
                            <i className="bx bx-comment"></i>
                            <span>{commentCount}</span>
                            <p className="m-0 d-lg-none d-xl-block">Comments</p>
                          </button>
                        </div>
                      ) : (
                        <div className="col p-0">
                          <button
                            className="InteractButton d-flex align-items-center justify-content-center gap-2"
                            onClick={focusCommentInput}
                          >
                            <i className="bx bx-comment"></i>
                            <span>{commentCount}</span>
                            <p className="m-0 d-none d-md-block">Comments</p>
                          </button>
                        </div>
                      )}
                      <div className="col p-0">
                        {currentUser.isAdmin ? (
                          <ChatButton
                            entry={entry}
                            imageFile={`http://localhost:8081${entry.profile_image}`}
                            userToChat={entry.userID}
                          ></ChatButton>
                        ) : (
                          <FlagButton
                            firstName={entry.firstName}
                            isAnon={entry.anonimity}
                            alias={entry.alias}
                            flaggedCount={flaggedCount}
                            userID={user.userID}
                            entryID={entry.entryID}
                            entry={entry.userID}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <CommentSection
                        ref={commentButtonInput}
                        commentCount={commentCount}
                        userID={user.userID}
                        entryID={entry.entryID}
                        entry={entry.userID}
                        firstName={entry.firstName}
                        lastName={entry.lastName}
                      ></CommentSection>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </MainLayout>
  );
};

export default DiaryEntry;
