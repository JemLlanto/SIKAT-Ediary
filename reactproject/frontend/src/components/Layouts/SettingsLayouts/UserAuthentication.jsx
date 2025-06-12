import { useState } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Swal from "sweetalert2";

const UserAuthentication = ({ cvsuEmail }) => {
  const [show, setShow] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const email = cvsuEmail;

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
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/send-otp`,
        {
          email: cvsuEmail,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent",
          text: "OTP has been sent to your CvSU email.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Error sending OTP. Please check your connection.",
      });
    } finally {
      setIsSendingOtp(false); // Reset sending state
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify-otp`,
        {
          email,
          otp,
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          setShow(false);
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "OTP verified successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          setOtp("");
          setIsVerifying(false);
        }, 1000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "OTP verification failed. Try again.",
        });
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("Verification error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "OTP verification failed. Try again.",
      });
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

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h5 className="m-0">Account Verification</h5>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-secondary">
            An OTP has been sent to{" "}
            <span className="text-success">{email}</span>, please verify your
            identity to access your security details.
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
            <p className="m-0">
              {isSendingOtp ? "Sending OTP..." : "Resend OTP"}
            </p>
          </button>
          <button
            className="primaryButton px-4 py-2"
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp === ""}
          >
            <p className="m-0">{isVerifying ? "Verifying..." : "Verify OTP"}</p>
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserAuthentication;
