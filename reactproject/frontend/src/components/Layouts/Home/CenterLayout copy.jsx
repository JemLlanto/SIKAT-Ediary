import DiaryEntryButton from "./DiaryEntryButton";
import { useState, useEffect, useCallback } from "react";
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

const CenterLayout = ({ setLoad, user, fetchUserData }) => {
  const [entries, setEntries] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [flaggingOptions, setFlaggingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [doneFetched, setDoneFetched] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const navigate = useNavigate();
  const ENTRIES_PER_PAGE = 5;

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

  // FETCHING FLAGGING OPTIONS
  useEffect(() => {
    const fetchFlaggingOptions = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flaggingOptions`
        );
        // console.log("flagging options", response.data);
        setFlaggingOptions(response.data);
      } catch (error) {
        console.error("Error fetching flagging options:", error);
      }
    };
    fetchFlaggingOptions();
  }, []);

  useEffect(() => {
    if (user && !doneFetched) {
      setPage(1);
      fetchFollowedUsers(user.userID);
      // fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

  const fetchFollowedUsers = async (userID) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/follow/fetchFollowedUsers/${userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchEntries = async (userID, filters, pageNum = 1, append = false) => {
    try {
      // console.log("Fetching entries for user:", userID);
      console.log("Loading Page:", pageNum);
      const loadingState = append ? setIsLoadingMore : setIsLoading;
      loadingState(true);

      if (!append) {
        fetchUserData();
      }

      // setIsLoading(true);
      fetchUserData();
      // console.log("Fetching entries with filters:", filters);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entries/fetchEntries`,
        {
          params: {
            userID: userID,
            filters: filters,
            page: pageNum,
            limit: ENTRIES_PER_PAGE,
          },
        }
      );

      // console.log("Entries response:", response.data);

      const gadifyStatusResponse = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/gadifyStatus/${userID}`
      );

      // console.log("Gadify status response:", gadifyStatusResponse.data);

      const updatedEntries = response.data.entries.map((entry) => {
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        return { ...entry, isGadified };
      });
      console.log("Updated entries: ", [...entries, ...updatedEntries]);
      setEntries((prevEntries) => [...prevEntries, ...updatedEntries]);
      // console.log("Current entries after fetch:", currentEntries);
      // Check if there are more entries to load
      setHasMore(
        response.data.hasMore || updatedEntries.length === ENTRIES_PER_PAGE
      );
      console.log(
        "Has more: ",
        response.data.hasMore || updatedEntries.length === ENTRIES_PER_PAGE
      );
      // setEntries(updatedEntries);
    } catch (error) {
      console.error("There was an error fetching the diary entries!", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setDoneFetched(true);
    }
  };

  // Load more entries (for infinite scroll)
  const loadMoreEntries = useCallback(() => {
    if (!isLoadingMore && hasMore && doneFetched) {
      const nextPage = page + 1;
      console.log("Loading more entries for page:", nextPage);
      setPage(nextPage);
      fetchEntries(user.userID, filters, nextPage, true);
    } else {
      console.log("Cannot load more:", {
        isLoadingMore,
        hasMore,
        doneFetched,
      });
    }
  }, [page, isLoadingMore, hasMore, user.userID, filters, doneFetched]);

  // Scroll handler for infinite scrolling
  const handleScroll = useCallback(() => {
    const isNearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.offsetHeight - 200;

    if (isNearBottom && !isLoadingMore && hasMore && doneFetched) {
      console.log("Near bottom, loading more entries");
      loadMoreEntries();
    }
  }, [isLoadingMore, hasMore, doneFetched, loadMoreEntries]);

  // Fixed throttled scroll handler
  const throttledHandleScroll = useCallback(() => {
    if (window.scrollThrottle) return;

    window.scrollThrottle = setTimeout(() => {
      handleScroll();
      window.scrollThrottle = null; // ✅ Fixed: Clear the throttle
    }, 200);
  }, [handleScroll]);

  // Set up scroll listener with proper cleanup
  useEffect(() => {
    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (window.scrollThrottle) {
        clearTimeout(window.scrollThrottle);
        window.scrollThrottle = null;
      }
    };
  }, [throttledHandleScroll]);

  // Loading indicator component
  const LoadingIndicator = () => <CenterLoader />;

  // Refresh all entries
  const refreshEntries = () => {
    console.log("Refreshing entries");
    // setEntries([]);
    setPage(1);
    setHasMore(true);
    setDoneFetched(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      fetchEntries(user.userID, filters, 1, false);
    }, 500);
  };

  // Filter entries by scheduled date
  // const filteredEntries = entries.filter((entry) => {
  //   const scheduledDate = new Date(entry.scheduledDate);
  //   const dateToBePosted = new Date();
  //   return scheduledDate < dateToBePosted;
  // });

  const handleFilterChange = (selectedFiltersArray) => {
    const activeFilters = [];

    selectedFiltersArray.forEach((filter) => {
      if (filter) activeFilters.push(filter);
    });

    setFilters(activeFilters);
    // console.log("Active Filters:", activeFilters);
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
      // Use UTC methods to get the original time
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      });
    }
  };

  // FOR INFINITE SCROLLING
  const [visibleEntries, setVisibleEntries] = useState(10);

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
          <PostButton
            setLoad={setLoad}
            fetchEntries={fetchEntries}
            onEntrySaved={() => fetchEntries(user.userID, filters)}
          />
        ) : (
          <DiaryEntryButton
            setLoad={setLoad}
            fetchEntries={fetchEntries}
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

                  console.log("Now:", now.toISOString());
                  console.log("Scheduled:", scheduledDate.toISOString());
                  console.log("Should show:", scheduledDate > now);

                  return scheduledDate > now;
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
                                src={entry.profile_image}
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
        <CenterLoader />
      ) : (
        <>
          asdasd
          {entries.length === 0 ? (
            <p>No entries available.</p>
          ) : (
            entries.map((entry, index) => (
              <DiaryEntryLayout
                key={index}
                flaggingOptions={flaggingOptions}
                entry={entry}
                user={user}
                followedUsers={followedUsers}
                suspended={entry.isSuspended}
                fetchFollowedUsers={fetchFollowedUsers}
                setFollowedUsers={setFollowedUsers}
              />
            ))
          )}
          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && <LoadingIndicator />}
          {/* End of entries */}
          {!isLoadingMore && !hasMore && (
            <div className="text-center mt-3">
              <button
                className="w-100 btn btn-secondary"
                onClick={refreshEntries}
              >
                You reached the end, see new entries.
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CenterLayout;
