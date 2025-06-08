import DiaryEntryButton from "./DiaryEntryButton";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Modal } from "react-bootstrap";
import axios from "axios";
import FilterButton from "./FilterButton";
import CenterLoader from "../../loaders/CenterLoader";
import DiaryEntryLayout from "./DiaryEntryLayout";
import PostButton from "./PostButton";
import MessageModal from "../DiaryEntry/messageModal";
import EditPostButton from "./EditPostButton";
import DeleteButton from "../DiaryEntry/DeleteButton";
import MessageAlert from "../DiaryEntry/messageAlert";
import NewUserSetUp from "../../pages/PagesUser/NewUserSetUp";
import FilterButtonAdmin from "./FilterButtonAdmin";

const CenterLayout = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [doneFetched, setDoneFetched] = useState(false);

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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      // setIsLoading(false);
    } else {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    if (user && !doneFetched) {
      fetchFollowedUsers(user.userID);
      // fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/followedUsers/${userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchEntries = async (userID, filters) => {
    try {
      // console.log("Fetching entries for user:", userID);
      // console.log("Applied filters:", filters);
      setIsLoading(true);
      console.log("Fetching entries with filters:", filters);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entries/fetchEntries`,
        {
          params: { userID: userID, filters: filters },
        }
      );

      // console.log("Entries response:", response.data);

      const gadifyStatusResponse = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/gadifyStatus/${userID}`
      );

      // console.log("Gadify status response:", gadifyStatusResponse.data);

      const updatedEntries = response.data.map((entry) => {
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        return { ...entry, isGadified };
      });
      console.log(
        "Entry subjects: ",
        updatedEntries.map((e) => e.subjects)
      );
      setEntries(updatedEntries);
    } catch (error) {
      console.error("There was an error fetching the diary entries!", error);
    } finally {
      setDoneFetched(true);
      console.log("Entries Fetched...");
      setIsLoading(false);
    }
  };

  const handleFilterChange = (selectedFiltersArray) => {
    const activeFilters = [];

    selectedFiltersArray.forEach((filter) => {
      if (filter) activeFilters.push(filter);
    });

    setFilters(activeFilters);
    // console.log("Active Filters:", activeFilters);
  };

  const handleGadify = (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entry/${entryID}/gadify`,
        {
          userID: user.userID,
        }
      )
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
            .post(
              `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/notifications/${entry.userID}`,
              {
                actorID: user.userID,
                entryID: entryID,
                profile_image: user.profile_image,
                type: "gadify",
                message: `${user.firstName} ${user.lastName} gadified your diary entry.`,
              }
            )
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
                `${
                  import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                }/unfollow/${followUserId}`,
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
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );

        // Update followed users list after following
        setFollowedUsers((prev) => [...prev, followUserId]);

        // Show success modal
        setModal({
          show: true,
          message: `You are now following ${targetUsername}.`,
        });

        // Send follow notification to the followed user
        await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/notifications/${followUserId}`,
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

  const handleClick = (entryID) => {
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.entryID === entryID
          ? { ...entry, isGadified: !entry.isGadified }
          : entry
      )
    );

    const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setExpandButtons(updatedExpandButtons);

    setTimeout(() => {
      updatedExpandButtons[entryID] = false;
      setExpandButtons({ ...updatedExpandButtons });
    }, 300);

    handleGadify(entryID);
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
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // FOR INFINITE SCROLLING
  const [visibleEntries, setVisibleEntries] = useState(10);

  const loadMoreEntries = () => {
    setVisibleEntries((prev) => prev + 10); // Load 10 more entries
  };

  if (!user) return null;

  return (
    <div
      className="overflow-hidden mt-5 mt-lg-0 ms-0 ms-md-3 ms-lg-0 pb-2"
      style={{ minHeight: "50rem" }}
    >
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

      {!user.isAdmin && user.isNewAccount ? (
        <NewUserSetUp user={user}></NewUserSetUp>
      ) : null}

      <div
        className="rounded shadow-sm p-3 my-1"
        style={{ backgroundColor: "white" }}
      >
        {user.isAdmin ? (
          <PostButton onEntrySaved={() => fetchEntries(user.userID, filters)} />
        ) : (
          <DiaryEntryButton
            onEntrySaved={() => fetchEntries(user.userID, filters)}
          />
        )}
      </div>
      {user.isAdmin ? (
        <>
          {/* FOR SCHEDULED POST */}
          {entries.length === 0
            ? ""
            : entries
                .filter((entry) => {
                  const now = new Date();
                  const scheduledDate = new Date(entry.scheduledDate);

                  const dateToBePosted = new Date();
                  return scheduledDate > dateToBePosted;
                })
                .map((entry) => (
                  <>
                    <div
                      className="position-relative rounded shadow-sm p-3 mb-3"
                      style={{ backgroundColor: "white", width: "100%" }}
                    >
                      <div className="d-flex align-items-start justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2 text-secondary">
                          <Link
                            to={`/Profile/${entry.userID}`}
                            className="linkText rounded p-0"
                          >
                            <div className="profilePicture">
                              <img
                                src={
                                  entry.profile_image
                                    ? `${
                                        import.meta.env
                                          .VITE_REACT_APP_BACKEND_BASEURL
                                      }${entry.profile_image}`
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

                          <div className="d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              {entry.anonimity === "private" ? (
                                <h5 className="m-0">
                                  {entry.alias}
                                  {user.userID === entry.userID ? " (You)" : ""}
                                </h5>
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
                                      : user.firstName +
                                        " " +
                                        user.lastName}{" "}
                                    <span
                                      className=""
                                      style={{ color: "var(--primary)" }}
                                    >
                                      (Scheduled Post)
                                    </span>
                                  </h5>
                                </Link>
                              )}
                            </div>
                            <p
                              className="m-0 d-flex align-items-center gap-1"
                              style={{ fontSize: ".7rem" }}
                            >
                              Scheduled date: {formatDate(entry.scheduledDate)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Dropdown>
                            <Dropdown.Toggle
                              className="btn-light d-flex align-items-center pt-0 pb-2"
                              id="dropdown-basic"
                              bsPrefix="custom-toggle"
                            >
                              <h5 className="m-0">...</h5>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="p-2">
                              <Dropdown.Item className="p-0 btn btn-light">
                                <EditPostButton
                                  entryID={entry.entryID}
                                  diaryTitle={entry.title}
                                  diaryDesc={entry.description}
                                  diaryVisib={entry.visibility}
                                  diaryAnon={entry.anonimity}
                                  diarySub={entry.subjects}
                                  imageFile={
                                    entry.diary_image &&
                                    `${
                                      import.meta.env
                                        .VITE_REACT_APP_BACKEND_BASEURL
                                    }${entry.diary_image}`
                                  }
                                  scheduledDate={entry.scheduledDate}
                                ></EditPostButton>
                              </Dropdown.Item>
                              <Dropdown.Item className="p-0 btn btn-light">
                                <DeleteButton
                                  entryID={entry.entryID}
                                  title={entry.title}
                                ></DeleteButton>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                      <div
                        className="text-start text-secondary pt-2"
                        style={{ minHeight: "5rem" }}
                      >
                        <div className="d-flex gap-1 align-items-center mt-2">
                          <div className="d-flex flex-column gap-1">
                            <h5 className="m-0">
                              {entry.title}
                              {/* {user} */}
                            </h5>
                          </div>
                        </div>

                        <p className="m-0" style={{ whiteSpace: "pre-wrap" }}>
                          {entry.description}
                        </p>

                        {/* Clickable Image */}
                        {entry.diary_image && (
                          <>
                            <img
                              className="DiaryImage mt-1 rounded"
                              src={`${
                                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
                              }${entry.diary_image}`}
                              alt="Diary"
                              style={{ cursor: "pointer", opacity: ".5" }} // Add pointer cursor
                              onClick={() => handleShowModal(entry.entryID)} // Open modal on click
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ))}
        </>
      ) : null}
      {user.isAdmin ? (
        <>
          <div className="d-flex justify-content-end">
            <FilterButtonAdmin
              fetchEntries={fetchEntries}
              onFilterChange={handleFilterChange}
              userID={user.userID}
            />
          </div>
        </>
      ) : (
        <div className="d-flex justify-content-end">
          <FilterButton
            fetchEntries={fetchEntries}
            onFilterChange={handleFilterChange}
            userID={user.userID}
          />
        </div>
      )}
      {isLoading ? (
        <>
          <CenterLoader></CenterLoader>
        </>
      ) : (
        <>
          {/* FOR POSTED DIARIES */}
          {entries.length === 0 ? (
            <p>No entries available.</p>
          ) : (
            entries
              .filter((entry) => {
                const now = new Date();
                const scheduledDate = new Date(entry.scheduledDate);
                const dateToBePosted = new Date();
                return scheduledDate < dateToBePosted;
              })
              .slice(0, visibleEntries)
              .map((entry) => (
                <DiaryEntryLayout
                  // key={entry.entryID}
                  entry={entry}
                  user={user}
                  followedUsers={followedUsers}
                  suspended={entry.isSuspended}
                  handleFollowToggle={handleFollowToggle}
                  handleClick={handleClick}
                  expandButtons={expandButtons}
                  formatDate={formatDate}
                />
              ))
          )}
          {visibleEntries < entries.length ? (
            <button
              className="w-100 btn btn-secondary"
              onClick={loadMoreEntries}
            >
              Load More
            </button>
          ) : (
            <>
              <button
                className="w-100 btn btn-secondary"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
                  setTimeout(() => {
                    window.location.reload(); // Refresh page
                  }, 500); // Wait for smooth scroll before refreshing
                }}
              >
                Your reached the end, see new entries.
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CenterLayout;
