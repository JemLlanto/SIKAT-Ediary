import DefaultProfile from "../../../assets/userDefaultProfile.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LeftSideLoader } from "../../loaders/LeftSideLoader";
import axios from "axios";

const LeftSideAdmin = () => {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      fetchUserData(parsedUser.userID);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user && !isLoading) {
      fetchEntries();
    }
  }, [user, isLoading]);

  const fetchUserData = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchUser/user/${userID}`
      );

      if (response.status !== 200) {
        throw new Error("User not found");
      }

      const data = response.data;
      setUser(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchUserEntry/user/${user.userID}`
      );
      setEntries(response.data.entries || []);
    } catch (err) {
      setError("Error fetching entries.");
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return <LeftSideLoader />;
  }

  if (!user) return <p className="text-danger">Error fetching user data.</p>;

  return (
    <div className="p-2">
      <Link
        className="text-decoration-none text-dark"
        to={`/Profile/${user.userID}`}
      >
        <div className="mainProfilePicture d-flex align-items-center flex-column rounded gap-2 shadow py-4">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: "#ffff",
              width: "clamp(7rem, 10vw, 15rem)",
              height: "clamp(7rem, 10vw, 15rem)",
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <img
              src={
                user.profile_image
                  ? `http://localhost:8081${user.profile_image}`
                  : DefaultProfile
              }
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h5 className="m-0 mt-1 text-light">
            {user.firstName}{" "}
            {user.departmentMod ? (
              <>{user.isAdmin === 1 ? "(Admin)" : "(Moderator)"}</>
            ) : null}
          </h5>
        </div>
      </Link>

      <div className="mt-3">
        <div className="d-flex align-items-center justify-content-between border-bottom border-secondary-subtle pb-2">
          <div className="d-flex align-items-center text-secondary gap-1">
            <i className="bx bx-edit bx-sm"></i>
            <h5 className="m-0 text-start">
              {user.isAdmin ? "Latest Post" : "My Diary Entries"}
            </h5>
          </div>
          <Link to="/DiaryEntries" className="linkText rounded p-1">
            <p className="m-0">View All</p>
          </Link>
        </div>
        <div
          className="mt-1 pe-1 custom-scrollbar"
          style={{ height: "45vh", overflowY: "scroll" }}
        >
          {error ? (
            <p className="text-danger">{error}</p>
          ) : entries.length === 0 ? (
            <p className="m-0 text-secondary mt-1 mt-xl-3">
              No entries available.
            </p>
          ) : (
            entries.map((entry) => (
              <Link
                key={entry.entryID}
                to={`/DiaryEntry/${entry.entryID}`}
                className="rounded text-decoration-none"
              >
                <div className="journalEntries d-flex flex-column rounded ps-1 mt-1">
                  <div>
                    <div className="d-flex flex-column align-items-start p-1">
                      <p className="m-0 text-start text-secondary">
                        {entry.title}{" "}
                        <span className="">
                          {entry.visibility === "private" ? (
                            <i class="bx bx-lock-alt"></i>
                          ) : (
                            <>
                              <i class="bx bx-globe"></i>
                              {entry.anonimity === "private" ? (
                                <>
                                  <i class="bx bxs-user position-relative">
                                    <i
                                      class="bx bx-question-mark position-absolute"
                                      style={{
                                        left: ".5rem",
                                        fontSize:
                                          "clamp(0.6rem, 1.5dvw, 0.7rem)",
                                      }}
                                    ></i>
                                  </i>
                                </>
                              ) : null}
                            </>
                          )}
                        </span>
                      </p>
                      <span
                        className="text-secondary"
                        style={{ fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)" }}
                      >
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSideAdmin;
