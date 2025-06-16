import React, { useState, useEffect } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import DefaultProfile from "../../assets/userDefaultProfile.png";
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
import BackButton from "../Layouts/Home/BackButton";
import CenterLoader from "../loaders/CenterLoader";
import Swal from "sweetalert2";
// import Suspended from "../../components/pages/PagesUser/Suspended";

const Profile = () => {
  const { userID } = useParams();
  const { user, setUserData } = useOutletContext();
  const [profileOwner, setProfileOwner] = useState({});
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [entries, setEntries] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [expandButtons, setExpandButtons] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

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
    const userData = localStorage.getItem("user");

    if (userData) {
      // setLoading(false);
    } else {
      navigate("/");
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/fetchUser/user/${userID}`
      );
      if (!response.ok) throw new Error("User not found");
      const data = await response.json();

      // console.log("User data:", data ? "Has data" : "");

      setProfileOwner(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userID) {
      console.log("Fetching profile data...");
      fetchUserData();
    }
  }, [userID, navigate]);

  useEffect(() => {
    if (Object.keys(profileOwner).length > 0) {
      console.log(Object.keys(profileOwner).length);
      fetchFollowedUsers(user?.userID);
      fetchEntries();
    }
  }, [profileOwner, userID]);

  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      console.log("Fetching entry data...");
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/entries/fetchLeftSideEntry/${profileOwner.userID}`
      );

      if (response.data.entries && Array.isArray(response.data.entries)) {
        setEntries(response.data.entries);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setError("No entries available.");
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (selectedFile) {
      const allowedTypes = ["image/png", "image/jpeg"];

      if (!allowedTypes.includes(selectedFile.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Only PNG and JPEG files are allowed.",
        });
        setFile(null);
        return;
      }

      if (selectedFile.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "File size exceeds the 5MB limit. Please select a smaller file.",
        });
        setFile(null);
        return;
      }

      setFile(selectedFile);
      uploadProfile(selectedFile);
    }
  };

  const uploadProfile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userID", profileOwner.userID);

    const result = await Swal.fire({
      icon: "question",
      title: "Change Profile?",
      text: "Are you sure you want to change your profile picture?",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsUploading(true);
        const res = await axios.post(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/uploadProfileAPI/uploadProfile`,
          formData
        );
        console.log("Profile uploaded successfully", res.data);
        await Swal.fire({
          icon: "success",
          title: "Uploaded",
          text: "Profile uploaded successfully.",
          timer: 2000,
          showConfirmButton: true,
        });
        console.log("New profile URL: ", res.data.filePath);
        const updatedUser = {
          ...profileOwner,
          profile_image: res.data.filePath,
        };
        setProfileOwner(updatedUser);
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error uploading profile:", error);
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "There was an error uploading your profile. Please try again.",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      setIsUploading(false);
    }
  };

  const fetchFollowedUsers = async () => {
    try {
      if (!user || !user.userID) {
        console.error("Current user or userID is not available");
        return;
      }
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/follow/fetchFollowedUsers/${user.userID}`
      );
      const followedUsersData = response.data.map((user) => user.userID);
      setFollowedUsers(followedUsersData);
      console.log("Followed Users:", followedUsersData);
    } catch (error) {
      console.error("Error fetching followed users:", error);
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
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/follow/${followUserId}`,
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

  if (error) return <p>{error}</p>;

  const ownProfile = user?.userID == userID;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <>
      <div className="pt-4 pt-lg-0">
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
              isAdmin={user?.isAdmin}
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
                {isUploading || loading ? (
                  <>
                    <div
                      className="position-absolute rounded-circle d-flex justify-content-center align-items-center"
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      <h2 className="m-0 text-dark ">
                        <span className="d-flex align-items-center justify-content-center gap-1">
                          <i className="bx bx-loader bx-spin"></i>
                        </span>
                      </h2>
                    </div>
                  </>
                ) : null}

                {loading ? (
                  <>
                    <img
                      src={DefaultProfile}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={`${profileOwner.profile_image}`}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </>
                )}
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
                        accept="image/png, image/jpeg"
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
                className="w-100 d-flex flex-column align-items-center align-items-lg-start gap-1 position-relative rounded border-bottom pt-2 pt-lg-5"
                style={{ height: "80%" }}
              >
                {loading ? (
                  <>
                    <div className="m-0 w-100 d-flex flex-column align-items-center align-items-lg-start gap-1">
                      <div
                        className="bg-secondary-subtle"
                        style={{
                          height: "1.5rem",
                          width: "clamp(13rem, 40dvw, 17rem)",
                        }}
                      ></div>

                      <div
                        className="bg-secondary-subtle "
                        style={{
                          height: "1.5rem",
                          width: "clamp(12rem, 40dvw, 14rem)",
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="m-0">
                        {profileOwner.firstName} {profileOwner.lastName}
                        {ownProfile ? (
                          <> ({profileOwner.alias || "No Alias"})</>
                        ) : null}
                        {profileOwner.isAdmin ? (
                          <>
                            <h5 className="m-0 text-secondary d-flex align-items-center justify-content-center justify-content-lg-start gap-1">
                              {profileOwner.isAdmin === 1 &&
                                `GAD-CCAT Campus Administrator`}
                              {profileOwner.isAdmin === 2 &&
                                `${profileOwner.DepartmentName} Moderator`}
                              <i className="bx bx-check-shield text-primary"></i>
                            </h5>
                          </>
                        ) : null}
                      </h4>
                      {user?.isAdmin ? (
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
                      {user?.isAdmin ? (
                        <h5 className="text-danger">
                          {profileOwner.isSuspended ? "Suspended " : ""}
                          {suspensionTime(profileOwner.suspendUntil)}
                        </h5>
                      ) : (
                        ""
                      )}
                    </div>
                  </>
                )}
                {loading ? (
                  <div
                    className="bg-secondary-subtle mt-2"
                    style={{ height: "1rem", width: "15rem" }}
                  ></div>
                ) : (
                  <>
                    {!profileOwner.isAdmin ? (
                      <Followers
                        ownProfile={ownProfile}
                        user={profileOwner}
                      ></Followers>
                    ) : null}
                  </>
                )}
                {loading ? (
                  <div
                    className="bg-secondary-subtle mt-2"
                    style={{ height: "1rem", width: "25rem" }}
                  ></div>
                ) : (
                  <>
                    <p className="mt-3 text-secondary">
                      {profileOwner.bio || "No bio available."}
                    </p>
                  </>
                )}
              </div>

              {loading ? null : (
                <>
                  <div
                    className="w-100 d-flex justify-content-center justify-content-lg-between algn-items-center pt-1"
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
                        {user?.isAdmin ? (
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
                          <>{profileOwner.isAdmin ? null : <></>}</>
                        )}
                      </div>
                    )}

                    {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
                    {profileOwner.isAdmin ? null : (
                      <>
                        {ownProfile ? (
                          <ProfileDropdown
                            userID={profileOwner.userID}
                            isAdmin={user?.isAdmin}
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mt-2 overflow-hidden">
          <div className="row">
            <div className="col-lg-4 mb-2 p-0 px-md-1">
              {/* {currentUser && currentUser.isAdmin ? "Im Admin" : " Im Not"} */}
              <JournalEntries
                isAdmin={user?.isAdmin}
                entries={entries}
                ownProfile={ownProfile}
                loadingEntries={loadingEntries}
              />
              {/* {user.isSuspended} */}
            </div>

            <div className="col-md mb-2 p-0 px-md-1">
              {loadingEntries ? (
                <>
                  <CenterLoader />
                </>
              ) : (
                <>
                  {entries.length > 0 ? (
                    entries
                      .filter(
                        (entry) =>
                          user?.isAdmin ||
                          ownProfile ||
                          (entry.visibility !== "private" &&
                            entry.anonimity !== "private")
                      )
                      .map((entry) => (
                        <>
                          {!ownProfile &&
                          entry.visibility === "private" ? null : (
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
