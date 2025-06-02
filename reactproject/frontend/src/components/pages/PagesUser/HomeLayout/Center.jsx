import { useState, useEffect } from "react";
import axios from "axios";
import FilterButton from "../../../Layouts/LayoutUser/FilterButton";
import CenterLoader from "../../../loaders/CenterLoader";
import DiaryEntryButton from "../../../Layouts/Home/DiaryEntryButton";
import DiaryEntryLayout from "../../../Layouts/Home/DiaryEntryLayout";

const Center = () => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState([]);

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
      const response = await axios.get("http://localhost:8081/entries", {
        params: { userID: userID, filters: filters },
      });

      const gadifyStatusResponse = await axios.get(
        `http://localhost:8081/gadifyStatus/${userID}`
      );

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

    setFilters(activeFilters);
  };

  const handleFollowToggle = async (followUserId) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:8081/unfollow/${followUserId}`, {
          data: { followerId: user.userID },
        });

        setFollowedUsers((prev) => prev.filter((id) => id !== followUserId));
      } else {
        await axios.post(`http://localhost:8081/follow/${followUserId}`, {
          followerId: user.userID,
        });

        setFollowedUsers((prev) => [...prev, followUserId]);
      }

      await fetchFollowedUsers(user.userID);
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
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

  if (isLoading) {
    return <CenterLoader />;
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
          <DiaryEntryLayout
            key={entry.entryID}
            entry={entry}
            user={user}
            followedUsers={followedUsers}
            handleFollowToggle={handleFollowToggle}
            handleClick={handleClick}
            expandButtons={expandButtons}
            formatDate={formatDate}
          />
        ))
      )}
    </div>
  );
};

export default Center;
