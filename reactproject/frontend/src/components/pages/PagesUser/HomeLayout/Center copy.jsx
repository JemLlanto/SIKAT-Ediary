import DiaryEntryButton from "../../../Layouts/DiaryEntryButton";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FilterButton from "../../../Layouts/LayoutUser/FilterButton";
import CommentSection from "../../../Layouts/LayoutUser/CommentSection";
import HomeDiaryDropdown from "../../../Layouts/LayoutUser/HomeDiaryDropdown";
import CenterLoader from "../../../loaders/CenterLoader";
import userDefaultProfile from "../../../../assets/userDefaultProfile.png";

const Center = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [activeButtons, setActiveButtons] = useState({});
  const [expandButtons, setExpandButtons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    sexualHarassment: false,
    domesticAbuse: false,
    genderRelated: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFollowedUsers(user.userID);
      fetchEntries(user.userID, filters);
    }
  }, [user, filters]);

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

  const fetchEntries = async (userID, filters) => {
    try {
      console.log("Fetching entries for user:", userID);
      console.log("Applied filters:", filters);

      const response = await axios.get("http://localhost:8081/entries", {
        params: { userID: userID, filters: filters }, // Now passing an array of filter strings
      });

      console.log("Entries response:", response.data);

      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${userID}`
      );

      console.log("Gadify status response:", gadifyStatusResponse.data);

      const updatedEntries = response.data.map((entry) => {
        const isGadified = gadifyStatusResponse.data.some(
          (g) => g.entryID === entry.entryID
        );
        return { ...entry, isGadified };
      });

      setEntries(updatedEntries);
    } catch (error) {
      console.error("There was an error fetching the diary entries!", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (selectedFiltersArray) => {
    // Build an array of active filters as strings
    const activeFilters = [];

    if (selectedFiltersArray.includes("Sexual Harassment")) {
      activeFilters.push("Sexual Harassment");
    }

    if (selectedFiltersArray.includes("Domestic Abuse")) {
      activeFilters.push("Domestic Abuse");
    }

    if (selectedFiltersArray.includes("Gender Related")) {
      activeFilters.push("Gender Related");
    }

    // Send the array of active filters to the state
    setFilters(activeFilters);
  };

  const handleGadify = (entryID) => {
    if (!user) return;

    const entry = entries.find((entry) => entry.entryID === entryID);
    if (!entry) return;

    axios
      .post(`http://localhost:8081/entry/${entryID}/gadify`, {
        userID: user.userID,
      })
      .then((res) => {
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.entryID === entryID
              ? {
                  ...entry,
                  gadifyCount:
                    res.data.message === "Gadify action recorded successfully"
                      ? entry.gadifyCount + 1
                      : entry.gadifyCount - 1,
                }
              : entry
          )
        );

        // Add notification for the entry owner
        if (user.userID !== entry.userID) {
          // Only notify if the user is not the owner
          axios
            .post(`http://localhost:8081/notifications/${entry.userID}`, {
              actorID: user.userID,
              entryID: entryID,
              type: "gadify",
              message: `${user.username} gadified your diary entry.`,
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

  const handleFollowToggle = async (followUserId) => {
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
        await axios.delete(`http://localhost:8081/unfollow/${followUserId}`, {
          data: { followerId: user.userID },
        });

        setFollowedUsers((prev) => prev.filter((id) => id !== followUserId));
        alert(`You have unfollowed user ${followUserId}`);
      } else {
        await axios.post(`http://localhost:8081/follow/${followUserId}`, {
          followerId: user.userID,
        });

        setFollowedUsers((prev) => [...prev, followUserId]);
        alert(`You are now following user ${followUserId}`);

        // Send follow notification
        await axios.post(
          `http://localhost:8081/notifications/${followUserId}`,
          {
            userID: followUserId, // Notify the user who was followed
            actorID: user.userID, // The user who performed the follow action
            entryID: null,
            type: "follow",
            message: `${user.username} has followed you.`,
          }
        );
      }

      await fetchFollowedUsers(user.userID);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("There was an error processing your request.");
    }
  };

  const handleClick = (entryID) => {
    const updatedActiveButtons = {
      ...activeButtons,
      [entryID]: !activeButtons[entryID],
    };
    setActiveButtons(updatedActiveButtons);

    const updatedExpandButtons = { ...expandButtons, [entryID]: true };
    setExpandButtons(updatedExpandButtons);

    setTimeout(() => {
      updatedExpandButtons[entryID] = false;
      setExpandButtons({ ...updatedExpandButtons });
    }, 300);

    handleGadify(entryID);
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    // Check if the time difference is less than 24 hours (in milliseconds)
    if (timeDiff < 24 * 60 * 60 * 1000) {
      // Return time formatted as "HH:MM AM/PM"
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Return date formatted as "MMM D"
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return <CenterLoader></CenterLoader>;
  }

  if (!user) return null;

  return (
    <div className="p-2">
      <div
        className="rounded shadow-sm p-3 mt-1"
        style={{ backgroundColor: "white" }}
      >
        <DiaryEntryButton
          onEntrySaved={() => fetchEntries(user.userID, filters)}
        />
      </div>
      <div className="d-flex justify-content-end">
        <FilterButton onFilterChange={handleFilterChange} />
      </div>
      {entries.length === 0 ? (
        <p>No entries available.</p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.entryID}
            className="position-relative rounded shadow-sm p-3 mb-2"
            style={{ backgroundColor: "white" }}
          >
            <div className="position-absolute" style={{ right: "20px" }}>
              <HomeDiaryDropdown />
            </div>
            <div className="d-flex align-items-start border-bottom pb-2">
              <Link
                to={`/OtherProfile/${entry.userID}`}
                className="linkText rounded"
              >
                <div className="d-flex align-items-center gap-2">
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
                  <div className="d-flex flex-column align-items-start">
                    <p className="m-0">{entry.username}</p>
                    <p className="m-0" style={{ fontSize: ".7rem" }}>
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
              {user && user.userID !== entry.userID && (
                <div className="d-flex align-items-center gap-1">
                  <p className="m-0 fs-3 text-secondary">·</p>

                  <button
                    className="secondaryButton p-0 m-0"
                    onClick={() => handleFollowToggle(entry.userID)}
                    style={{ height: "1.5rem" }}
                  >
                    {followedUsers.includes(entry.userID)
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>
              )}
            </div>

            <div className="text-start border-bottom p-2">
              <h5>{entry.title}</h5>
              <p>{entry.description}</p>
              {entry.diary_image && (
                <img
                  className="DiaryImage mt-1 rounded"
                  src={`http://localhost:8081${entry.diary_image}`}
                  alt="Diary"
                />
              )}
            </div>
            <div className="row pt-2">
              <div className="col">
                <button
                  className={`InteractButton ${
                    entry.isGadified ? "active" : ""
                  } ${expandButtons[entry.entryID] ? "expand" : ""}`}
                  onClick={() => handleClick(entry.entryID)}
                >
                  <span>({entry.gadifyCount}) </span>Gadify
                </button>
              </div>
              <div className="col">
                <CommentSection
                  userID={user.userID}
                  entryID={entry.entryID}
                  entry={entry.userID}
                />
              </div>
              <div className="col">
                <button className="InteractButton">Flag</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Center;
