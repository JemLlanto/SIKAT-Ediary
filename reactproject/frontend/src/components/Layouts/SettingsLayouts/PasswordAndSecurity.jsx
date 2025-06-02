import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import axios from "axios";
import MessageModal from "../DiaryEntry/messageModal";

const PasswordAndSecurity = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

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
      const parsedData = JSON.parse(userData);
      setEmail(parsedData.cvsuEmail);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8081/reset-password",
        {
          email,
          password: newPassword,
        }
      );
      setModal({
        show: true,
        message: `Password Updated.`,
      });
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "An error occurred.");
      } else {
        setErrorMessage("Unable to connect to the server.");
      }
    }
  };

  return (
    <div
      className="p-3 rounded shadow-sm"
      style={{
        backgroundColor: "#ffff",
        minHeight: "clamp(20rem, 20vh, 30rem)",
      }}
    >
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <MessageModal
        showModal={confirmModal}
        closeModal={closeConfirmModal}
        title={"Confirmation"}
        message={confirmModal.message}
        confirm={confirmModal.onConfirm}
        needConfirm={1}
      ></MessageModal>

      <h5 className="border-bottom border-2 pb-2">Password and Security</h5>
      <form onSubmit={handlePasswordChange} autoComplete="off">
        <Row className="g-2 pt-2 text-start ">
          <h5 className="m-0">Change Password</h5>
          <p className="text-secondary m-0" style={{ fontSize: ".9rem" }}>
            Changing a password regularly enhances security by reducing the risk
            of unauthorized access to your accounts, especially if your previous
            password was compromised.
          </p>
          <Col md>
            <Form.Floating className="mb-2 mt-0 position-relative">
              <Form.Control
                id="newPasswordInput"
                name="new-password-field"
                type={showNewPassword ? "text" : "password"}
                placeholder=""
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label htmlFor="newPasswordInput">New Password</label>
              <div
                className="position-absolute d-flex align-items-center"
                style={{
                  height: "100%",
                  top: "0",
                  right: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <p className="secondaryButton m-0">
                  {showNewPassword ? "Hide" : "Show"}
                </p>
              </div>
            </Form.Floating>
            <Form.Floating className="mb-3 mt-0 position-relative">
              <Form.Control
                id="confirmPasswordInput"
                name="confirm-password-field"
                type={showConfirmPassword ? "text" : "password"}
                placeholder=""
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label htmlFor="confirmPasswordInput">Confirm Password</label>
              <div
                className="position-absolute d-flex align-items-center"
                style={{
                  height: "100%",
                  top: "0",
                  right: "1.5rem",
                  cursor: "pointer",
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <p className="secondaryButton m-0">
                  {showConfirmPassword ? "Hide" : "Show"}
                </p>
              </div>
            </Form.Floating>
            {errorMessage && <p className="text-danger m-0">{errorMessage}</p>}
          </Col>
        </Row>
        {successMessage && (
          <p className="text-success mt-2">{successMessage}</p>
        )}
        <div className="mt-4 d-flex justify-content-end">
          <button type="submit" className="primaryButton px-5 py-2">
            <p className="m-0">Save</p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordAndSecurity;
