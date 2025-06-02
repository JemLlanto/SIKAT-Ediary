import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpdateValidation from "../../UpdateValidation";
import AnonimityButton from "../../../Layouts/LayoutUser/AnonimityButton";

const EditPersonalDetailButton = () => {
  const [show, setShow] = useState(false);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    cvsuEmail: "",
    username: "",
    password: "",
    confirmPassword: "",
    alias: "",
    bio: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => {
    console.log("Edit Personal Details button clicked");
    setShow(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User data from local storage:", user);

    if (user && user.username) {
      const fetchUserDetails = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8081/fetchUser/user/${user.userID}`
          );
          const userDetails = response.data;

          setValues({
            firstName: userDetails.firstName || "",
            lastName: userDetails.lastName || "",
            cvsuEmail: userDetails.cvsuEmail || "",
            username: userDetails.username || user.username,
            alias: userDetails.alias || "",
            bio: userDetails.bio || "",
            password: "",
            confirmPassword: "",
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };
      fetchUserDetails();
    } else {
      navigate("/Login");
    }
  }, [navigate]);

  const UpdateValidation = (values) => {
    let errors = {};
    if (!values.username) {
      errors.username = "Username is required";
    }
    if (values.password && values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form submitted with values:", values);
    const validationErrors = UpdateValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const userID = JSON.parse(localStorage.getItem("user")).userID;
      const updatedValues = { ...values };

      console.log("Sending update request to server:", updatedValues);

      if (!updatedValues.password) {
        delete updatedValues.password;
      }
      if (!updatedValues.confirmPassword) {
        delete updatedValues.confirmPassword;
      }

      axios
        .put(`http://localhost:8081/EditProfile/${userID}`, updatedValues)
        .then((res) => {
          console.log("Profile updated successfully:", res);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...updatedValues,
              userID: userID,
            })
          );
          handleClose();
          window.location.reload();
          alert("Profile successfully updated.");
        })
        .catch((err) => {
          console.error("Error updating profile:", err);
          alert("Failed to update profile. Please try again.");
        });
    }
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
  console.log("Modal show state:", show);

  return (
    <>
      <button
        className="btn btn-light text-end"
        style={{ right: "10px", top: "10px" }}
        onClick={handleShow}
      >
        Edit Personal Details
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        keyboard={false}
        centered
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Personal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <h5>Profile Information</h5>
              <div className="row">
                <div className="col mb-3">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    onChange={handleInput}
                    className="form-control rounded"
                    value={values.firstName}
                    autoComplete="off"
                  />
                  {errors.firstName && (
                    <span className="text-danger"> {errors.firstName}</span>
                  )}
                </div>
                <div className="col mb-3">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    onChange={handleInput}
                    className="form-control rounded"
                    value={values.lastName}
                    autoComplete="off"
                  />
                  {errors.lastName && (
                    <span className="text-danger"> {errors.lastName}</span>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your Username"
                  onChange={handleInput}
                  className="form-control rounded"
                  value={values.username}
                  autoComplete="off"
                />
                {errors.username && (
                  <span className="text-danger"> {errors.username}</span>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="alias">Alias (for anonimity)</label>
                <input
                  type="text"
                  name="alias"
                  placeholder="Enter your Alias"
                  onChange={handleInput}
                  className="form-control rounded"
                  value={values.alias}
                  autoComplete="off"
                />
                {errors.alias && (
                  <span className="text-danger"> {errors.alias}</span>
                )}
              </div>
              <div className="form-floating mb-3">
                <textarea
                  className="form-control"
                  placeholder="Enter your Bio"
                  name="bio"
                  style={{ height: "100px" }}
                  value={values.bio}
                  onChange={handleInput}
                ></textarea>
                <label htmlFor="bio">Enter your Biio</label>
              </div>
            </div>
            <div>
              <h5>Privacy and Security</h5>
              <div className="mb-1">
                <p className="m-0">Interact Anonimously or Not</p>
                <AnonimityButton />
              </div>
              <div className="">
                <label htmlFor="password">
                  Password (Leave blank to keep current)
                </label>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Enter new Password"
                onChange={handleInput}
                className="form-control rounded mb-1"
                value={values.password}
                autoComplete="new-password"
                formNoValidate
              />
              {errors.password && (
                <span className="text-danger"> {errors.password}</span>
              )}
              <div className="mb-3">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new Password"
                  onChange={handleInput}
                  className="form-control rounded"
                  value={values.confirmPassword}
                  autoComplete="off"
                />
                {errors.confirmPassword && (
                  <span className="text-danger">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
            <Modal.Footer>
              <button type="submit" className="orangeButton w-100">
                Update
              </button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditPersonalDetailButton;
