import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Form, FloatingLabel } from "react-bootstrap";
import MessageModal from "../DiaryEntry/messageModal";

const ProfileInformation = ({ user }) => {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    alias: "",
    bio: "",
  });
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/fetchUser/user/${
          user.userID
        }`
      );
      const userDetails = response.data;
      setUserDetails(userDetails);
      setIsLoading(false);
      setValues({
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
        alias: userDetails.alias || "",
        bio: userDetails.bio || "",
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      fetchUserDetails();
    } else {
      navigate("/Login");
    }
  }, [user]);

  const handleSubmit = () => {
    setIsUpdating(true);
    axios
      .put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/EditProfile/${
          user.userID
        }`,
        values
      )
      .then((res) => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...currentUser,
          ...values, // Override with new values
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        fetchUserDetails();
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been successfully updated.",
        });
        setIsUpdating(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "Failed to update profile. Please try again.",
        });
        setIsUpdating(false);
      });
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
  const hasChanges = () => {
    return (
      values.firstName === userDetails.firstName &&
      values.lastName === userDetails.lastName &&
      values.alias === userDetails.alias &&
      values.bio === userDetails.bio
    );
  };

  return (
    <div
      className="p-3 rounded shadow-sm mb-3"
      style={{
        backgroundColor: "#ffff",
        minHeight: "clamp(22rem, 20vh, 30rem)",
      }}
    >
      <h4 className="border-bottom border-2 pb-2">Profile Information</h4>
      <div>
        <div className="row text-start">
          <h5 className="m-0">Display Name and Alias</h5>
          <p className="text-secondary m-0 mb-1" style={{ fontSize: ".9rem" }}>
            Using a full name builds credibility and trust but may expose the
            individual to risks. An alias, however, offers privacy and safety,
            allowing for open sharing without fear of judgment or backlash.
          </p>
          <div className=" row mt-1 pe-0 gy-1">
            <div className="col-md pe-0">
              <FloatingLabel controlId="floatingInputGrid" label="First name">
                <Form.Control
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={`${
                    isLoading ? "Loading first name..." : `${values.firstName}`
                  }`}
                  onChange={handleInput}
                />
              </FloatingLabel>
            </div>
            <div className="col-md pe-0">
              <FloatingLabel controlId="floatingInputGrid" label="Last name">
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={`${
                    isLoading ? "Loading last name..." : `${values.lastName}`
                  }`}
                  onChange={handleInput}
                />
              </FloatingLabel>
            </div>

            <div className="col-md-3 pe-0">
              <FloatingLabel controlId="floatingInputGrid" label="Alias">
                <Form.Control
                  type="text"
                  name="alias"
                  placeholder="Alias"
                  value={`${
                    isLoading ? "Loading alias..." : `${values.alias}`
                  }`}
                  onChange={handleInput}
                />
              </FloatingLabel>
            </div>
          </div>
        </div>

        <div className="row text-start mt-2">
          <h5 className="m-0 mt-2">Profile Details</h5>
          <p className="text-secondary m-0 mb-1" style={{ fontSize: ".9rem" }}>
            Your Username is your unique identifier visible to others on the
            platform. The Bio is a short description where you can share details
            about yourself or your interests.
          </p>
          <div className="mt-1 gap-2">
            <div>
              <FloatingLabel controlId="floatingTextarea2" label="Bio">
                <Form.Control
                  as="textarea"
                  name="bio"
                  placeholder="Bio"
                  style={{ height: "100px" }}
                  value={`${isLoading ? "Loading bio..." : `${values.bio}`}`}
                  onChange={handleInput}
                />
              </FloatingLabel>
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex justify-content-end">
          <button
            className="primaryButton px-5 py-2"
            disabled={hasChanges() || isUpdating}
            onClick={handleSubmit}
          >
            <p className="m-0">
              {isUpdating ? (
                <>
                  <span className="d-flex align-items-center justify-content-center gap-1">
                    <i className="bx bx-loader bx-spin"></i>
                    Saving
                  </span>
                </>
              ) : (
                <>Save</>
              )}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;
