import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import DefaultProfile from "../../assets/userDefaultProfile.png";
import MainLayout from "../Layouts/MainLayout";
import JournalEntries from "../Layouts/Profile/JournalEntries";
import DiaryEntryLayout from "../Layouts/Home/DiaryEntryLayout";
import ProfileDropdown from "../Layouts/Profile/ProfileDropdown";
import OthersProfileDropdown from "../Layouts/Profile/OthersProfileDropdown";
import axios from "axios";
// import { Accordion } from "react-bootstrap";
import FlaggedDiaries from "../Layouts/Profile/FlaggedDiaries";
import ReportedComments from "../Layouts/Profile/ReportedComments";
import Followers from "../Layouts/Profile/Followers";
import { SuspensionModal } from "../Layouts/Profile/SuspensionModal";
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import BackButton from "../Layouts/Home/BackButton";
// import Suspended from "../../components/pages/PagesUser/Suspended";

const Profile = () => {
  const { userID } = useParams();
  const [profileOwner, setProfileOwner] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [entries, setEntries] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [modal, setModal] = useState({
    show: false,
    message: "",
  });
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
    const fetchUserData = async () => {
      const userData = localStorage.getItem("user");

      if (!userData) {
        navigate("/");
        return;
      }
      const parsedUser = JSON.parse(userData);
      try {
        const response = await fetch(
          `http://localhost:8081/fetchUser/user/${parsedUser.userID}`
        );

        if (!response.ok) {
          throw new Error("User not found");
        }

        const data = await response.json();
        console.log("User data:", data);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, userID]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/fetchUser/user/${userID}`
        );
        if (!response.ok) throw new Error("User not found");
        const data = await response.json();

        console.log("User data:", data);

        setProfileOwner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID, navigate]);

  useEffect(() => {
    if (user) {
      fetchFollowedUsers(user.userID);
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8081/fetchUserEntry/user/${profileOwner.userID}`
      );

      if (response.data.entries && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("No entries available.");
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes

    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        setModal({
          show: true,
          message: `File size exceeds the 2MB limit. Please select a smaller file.`,
        });
        setFile(null);
      } else {
        setFile(selectedFile);

        uploadProfile(selectedFile);
      }
    }
  };

  const uploadProfile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userID", profileOwner.userID);

    setConfirmModal({
      show: true,
      message: `Are you sure you want to change your profile?`,
      onConfirm: async () => {
        axios
          .post("http://localhost:8081/uploadProfile", formData)
          .then((res) => {
            console.log("Profile uploaded successfully", res.data);
            setConfirmModal({ show: false, message: "" });
            setModal({
              show: true,
              message: `Profile uploaded successfully.`,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          })
          .catch((error) => {
            console.error("Error uploading profile:", error);
          });
      },
      onCancel: () => setConfirmModal({ show: false, message: "" }),
    });
  };

  const fetchFollowedUsers = async () => {
    try {
      if (!user || !user.userID) {
        console.error("Current user or userID is not available");
        return;
      }
      const response = await axios.get(
        `http://localhost:8081/followedUsers/${user.userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
      console.log("Followed Users:", followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
    }
  };

  const fetchFollowers = async (userID) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/followers/${userID}`
      );
      setFollowers(response.data);
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const handleFollowToggle = async (followUserId) => {
    if (!followUserId) {
      console.error("User ID to follow/unfollow is undefined");
      return;
    }

    if (user.userID === followUserId) {
      setModal({
        show: true,
        message: `You cannot follow yourself.`,
      });
      return;
    }

    const isFollowing = followedUsers.includes(followUserId);

    try {
      if (isFollowing) {
        setConfirmModal({
          show: true,
          message: `Are you sure you want to unfollow ${profileOwner.firstName}?`,
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
                message: `You have unfollowed ${profileOwner.firstName}.`,
              });

              // Refresh the followed users list from the backend
              await fetchFollowedUsers(profileOwner.userID);
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
        const response = await axios.post(
          `http://localhost:8081/follow/${followUserId}`,
          {
            followerId: user.userID,
          }
        );

        if (response.data.message === "Already following this user") {
          setModal({
            show: true,
            message: `You are already following this user.`,
          });
          return;
        }

        setFollowedUsers((prev) => [...prev, followUserId]);
        setModal({
          show: true,
          message: `You are now following ${profileOwner.username}.`,
        });

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
      }

      await fetchFollowedUsers(user.userID);
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setModal({
        show: true,
        message: `There was an error processing your request.`,
      });
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

  const suspensionTime = (suspendUntil) => {
    const now = new Date();
    const suspendDate = new Date(suspendUntil);

    const diff = suspendDate - now;

    if (diff <= 0) {
      return ``;
    }

    const year = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const month = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    const day = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hour = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minute = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Y:${year} M:${month} D:${day} H:${hour} M:${minute}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const ownProfile = user.userID == userID;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <MainLayout>
      <div
        className="container overflow-y-hidden d-flex rounded shadow-sm mt-4 p-2 pt-3 pt-md-2"
        style={{ background: "#ffff" }}
      >
        <BackButton></BackButton>
        <MessageModal
          showModal={modal}
          closeModal={closeModal}
          title={"Notice"}
          message={modal.message}
        ></MessageModal>
        <MessageModal
          showModal={confirmModal}
          closeModal={closeConfirmModal}
          title={"Notice"}
          message={confirmModal.message}
          confirm={confirmModal.onConfirm}
          needConfirm={1}
        ></MessageModal>

        {profileOwner.isSuspended ? (
          <SuspensionModal
            name={profileOwner.firstName}
            isAdmin={user.isAdmin}
            show={true}
          ></SuspensionModal>
        ) : (
          ""
        )}
        <div className="w-100 row m-0">
          <div className="col-lg-4 d-flex justify-content-center align-items-center mb-3 mb-lg-0 p-1 p-md-3">
            <div
              style={{
                position: "relative",
                backgroundColor: "#ffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "clamp(10rem, 17dvw, 20rem)",
                height: "clamp(10rem, 17dvw, 20rem)",
                borderRadius: "50%",
              }}
            >
              <img
                src={
                  profileOwner && profileOwner.profile_image
                    ? `http://localhost:8081${profileOwner.profile_image}`
                    : DefaultProfile
                }
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              {ownProfile && (
                <label
                  htmlFor="uploadProfile"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="grayHover d-flex align-items-center justify-content-center"
                    style={{
                      position: "absolute",
                      borderRadius: "50%",
                      width: "clamp(2.3rem, 3dvw, 3rem)",
                      height: "clamp(2.3rem, 3dvw, 3rem)",
                      border: "3px solid #ffff",
                      right: ".2rem",
                      bottom: "15px",
                    }}
                  >
                    <i
                      className={isHovered ? "bx bxs-camera" : "bx bx-camera"}
                      style={{
                        color: "var(--primary)",
                        fontSize: "clamp(1.5rem, 5dvw, 1.8rem)",
                      }}
                    ></i>
                    <input
                      type="file"
                      id="uploadProfile"
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="col-md d-flex align-items-end justify-content-between flex-column text-dark text-center text-lg-start">
            <div
              className="w-100 position-relative rounded border-bottom pt-2 pt-lg-5"
              style={{ height: "80%" }}
            >
              <div>
                <h4 className="m-0">
                  {profileOwner.firstName} {profileOwner.lastName}
                  {ownProfile ? (
                    <> ({profileOwner.alias || "No Alias"})</>
                  ) : null}
                  {profileOwner.isAdmin && (
                    <>
                      <h5 className="m-0 text-secondary d-flex align-items-center gap-1">
                        {profileOwner.isAdmin === 1 &&
                          `GAD-CCAT Campus Administrator`}
                        {profileOwner.isAdmin === 2 &&
                          `${profileOwner.DepartmentName} Moderator`}
                        <i class="bx bx-check-shield text-primary"></i>
                      </h5>
                    </>
                  )}
                </h4>
                {user.isAdmin ? (
                  <>
                    {!profileOwner.isAdmin && (
                      <>
                        <p className="m-0 text-secondary">
                          {profileOwner.cvsuEmail} -{" "}
                          {profileOwner.studentNumber}
                        </p>
                        <p className="m-0 mb-1 text-secondary">
                          {profileOwner.course}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  ""
                )}
                {user.isAdmin ? (
                  <h5 className="text-danger">
                    {profileOwner.isSuspended ? "Suspended " : ""}
                    {suspensionTime(profileOwner.suspendUntil)}
                  </h5>
                ) : (
                  ""
                )}
              </div>

              {!profileOwner.isAdmin ? (
                <Followers
                  ownProfile={ownProfile}
                  user={profileOwner}
                  // currentUser={user}
                  followersCount={profileOwner.followersCount}
                  followingCount={profileOwner.followingCount}
                ></Followers>
              ) : null}
              <p className="mt-3 text-secondary">
                {profileOwner.bio || "No bio available."}
              </p>
            </div>
            <div
              className="w-100 d-flex justify-content-center  justify-content-lg-between algn-items-center pt-1"
              style={{ height: "4rem" }}
            >
              {ownProfile ? (
                <div>
                  {/* <button className="primaryButton py-2 px-5">
                    <h5 className="m-0">Follow</h5>
                  </button> */}
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  {user.isAdmin ? (
                    <>
                      {profileOwner.isAdmin ? null : (
                        <>
                          <div className="d-flex gap-1">
                            <FlaggedDiaries
                              userID={profileOwner.userID}
                            ></FlaggedDiaries>
                            <ReportedComments
                              userID={profileOwner.userID}
                            ></ReportedComments>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {profileOwner.isAdmin ? null : (
                        <>
                          <button
                            className="primaryButton py-2 px-5"
                            onClick={() =>
                              handleFollowToggle(profileOwner.userID)
                            } // Use the user's ID directly
                            disabled={profileOwner.isAdmin}
                          >
                            <h5 className="m-0">
                              {" "}
                              {followedUsers.includes(profileOwner.userID)
                                ? "Unfollow"
                                : "Follow"}
                            </h5>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
              {profileOwner.isAdmin ? null : (
                <>
                  {ownProfile ? (
                    <ProfileDropdown
                      userID={profileOwner.userID}
                      isAdmin={user.isAdmin}
                    />
                  ) : (
                    <OthersProfileDropdown
                      user={user}
                      profileOwner={profileOwner}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-2 overflow-hidden">
        <div className="row">
          <div className="col-lg-4 mb-2 p-0 px-md-1">
            {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
            <JournalEntries
              user={profileOwner}
              isAdmin={user.isAdmin}
              userID={userID}
              ownProfile={ownProfile}
            />
            {/* {user.isSuspended} */}
          </div>

          <div className="col-md mb-2 p-0 px-md-1">
            {entries.length > 0 ? (
              entries
                .filter(
                  (entry) =>
                    user.isAdmin ||
                    ownProfile ||
                    (entry.visibility !== "private" &&
                      entry.anonimity !== "private")
                )
                .map((entry) => (
                  <>
                    {!ownProfile && entry.visibility === "private" ? null : (
                      <div className="w-100 ">
                        <DiaryEntryLayout
                          // key={entry.entryID}
                          entry={entry}
                          user={user}
                          // isGadified={entry.isGadified}
                          // currentUser={user}
                          // suspended={profileOwner.isSuspended}
                          followedUsers={followedUsers}
                          handleFollowToggle={handleFollowToggle}
                          handleClick={handleClick}
                          expandButtons={expandButtons}
                          formatDate={formatDate}
                        />
                      </div>
                    )}
                  </>
                ))
            ) : (
              <p className="m-0 text-secondary mt-1 mt-xl-3">
                No diary entries.
                {/* , Post{" "}
                <Link
                  className="text-decoration-none"
                  to={user && user.isAdmin ? "/Admin/Home" : "/Home"}
                >
                  here
                </Link>
                . */}
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
