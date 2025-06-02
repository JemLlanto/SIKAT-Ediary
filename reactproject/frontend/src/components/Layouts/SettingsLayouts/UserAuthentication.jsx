import { useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import MessageModal from "../DiaryEntry/messageModal";
import MessageAlert from "../DiaryEntry/messageAlert";

const UserAuthentication = ({ cvsuEmail }) => {
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const email = cvsuEmail;

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

  const handleClose = () => {
    if (
      !verificationStatus ||
      verificationStatus !== "OTP verified successfully!"
    ) {
      setModal({
        show: true,
        message: `OTP Required!`,
      });
      window.location.reload();
    }
    setShow(false);
    setOtp("");
    setVerificationStatus(null);
  };

  const handleShow = async () => {
    setShow(true);
    await sendOtp(); // Automatically send OTP when modal opens
  };

  const sendOtp = async () => {
    setIsSendingOtp(true); // Set sending state to true
    try {
      const response = await axios.post("http://localhost:8081/send-otp", {
        email: cvsuEmail,
      });

      if (response.status === 200) {
        setModal({
          show: true,
          message: `OTP has been sent to your CvSU email.`,
        });
      } else {
        setModal({
          show: true,
          message: `Failed to send OTP. Please try again.`,
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setModal({
        show: true,
        message: `Error sending OTP. Please check your connection.`,
      });
    } finally {
      setIsSendingOtp(false); // Reset sending state
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      const response = await axios.post("http://localhost:8081/verify-otp", {
        email,
        otp,
      });

      if (response.status === 200) {
        setTimeout(() => {
          setShow(false);
          setModal({
            show: true,
            message: `OTP verified successfully`,
          });
        }, 2000);
      } else {
        setVerificationStatus("OTP verification failed. Try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("OTP verification failed. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div
        className="w-100 d-flex align-items-center gap-2 ps-3 py-2"
        style={{ cursor: "pointer" }}
        onClick={handleShow}
      >
        <h5 className="m-0 d-flex align-items-center">
          <i className="bx bx-check-shield"></i>
        </h5>
        <p className="m-0">Password and Security</p>
      </div>
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

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5>Account Verification</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-secondary">
            An OTP has been sent to your CvSU email to verify your identity to
            access your security details.
          </p>
          <Form.Floating className="mb-3 mt-0 position-relative">
            <Form.Control
              id="otpInput"
              name="otp"
              type="text"
              placeholder="eg. 000000"
              autoComplete="off"
              value={otp}
              onChange={handleOtpChange}
            />
            <label htmlFor="otpInput">Enter the 6-digit OTP</label>
          </Form.Floating>
          {verificationStatus && (
            <p className="mt-2 text-center">{verificationStatus}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="orangeButton px-4 py-2"
            onClick={sendOtp}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? "Sending OTP..." : "Resend OTP"}
          </button>
          <button
            className="primaryButton px-4 py-2"
            onClick={handleVerifyOtp}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserAuthentication;
