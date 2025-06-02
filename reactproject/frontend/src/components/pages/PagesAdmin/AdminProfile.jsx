import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DefaultProfile from "../../../assets/userDefaultProfile.png";
import uploadProfileIcon from "../../../assets/uploadProfile.png";
import UserPageMainLayout from "../../Layouts/MainLayout";
import RecentJournalEntries from "./UserProfileLayout/JournalEntries";
import ActivityLogs from "./UserProfileLayout/ActivityLogs";
import FiledCases from "./UserProfileLayout/FiledCases";
import UserDiary from "./UserProfileLayout/UserDiary";
import EditPersonalDetailButton from "./UserProfileLayout/EditPersonalDetailButton";
import ProfileDropdown from "../../Layouts/LayoutUser/ProfileDropdown";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const fetchUser = JSON.parse(userData);

      fetch(`http://localhost:8081/fetchUser/user/${fetchUser.userID}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("User not found");
          }
          return response.json();
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      uploadProfile(selectedFile);
    }
  };

  const uploadProfile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userID", user.userID);

    axios
      .post("http://localhost:8081/uploadProfile", formData)
      .then((res) => {
        console.log("Profile uploaded successfully", res.data);
        alert("Profile uploaded successfully");
      })
      .catch((error) => {
        console.error("Error uploading profile:", error);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <MainLayout>
      <div
        className="container d-flex rounded shadow-sm mt-4 py-4 px-4"
        style={{ background: "#ffff" }}
      >
        <div className="w-100 row m-0 py-3">
          <div className="col-lg-4 d-flex justify-content-center align-items-center mb-3 mb-lg-0">
            <div
              style={{
                position: "relative",
                backgroundColor: "#ffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                overflow: "",
              }}
            >
              <img
                src={
                  user && user.profile_image
                    ? `http://localhost:8081${user.profile_image}`
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
              <label htmlFor="uploadProfile">
                <div
                  className="grayHover"
                  style={{
                    position: "absolute",
                    borderRadius: "50%",
                    width: "50px",
                    height: "50px",
                    border: "3px solid #ffff",
                    padding: "9px",
                    right: "15px",
                    bottom: "15px",
                  }}
                >
                  <img
                    src={uploadProfileIcon}
                    alt="Upload Icon"
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="file"
                    id="uploadProfile"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>
              </label>
            </div>
          </div>
          <div className="col-md d-flex align-items-end justify-content-between flex-column text-dark text-center text-md-start">
            <div
              className="w-100 position-relative rounded border-bottom p-4"
              style={{ background: "", height: "80%" }}
            >
              <h3 className="m-0">
                {user.firstName} {user.lastName} ({user.alias || "No Alias"})
                admin
              </h3>
              <p className="m-0 text-secondary">
                {user.followersCount} Followers - {user.followingCount}{" "}
                Following
              </p>
              <p className="mt-3">{user.bio || "No bio available."}</p>
            </div>
            <div className="">
              <ProfileDropdown></ProfileDropdown>
            </div>
          </div>
        </div>
      </div>
      <div className="container mt-3">
        <div className="row ">
          <div className="col-lg-4 mb-2 p-0 px-md-2">
            <div
              className="position-sticky d-flex flex-column gap-2"
              style={{ minHeight: "37vh", top: "70px" }}
            >
              <div>
                <RecentJournalEntries />
              </div>
            </div>
          </div>

          <div className="col p-0 px-md-2">
            <div className="" style={{ minHeight: "60vh" }}>
              <UserDiary />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
