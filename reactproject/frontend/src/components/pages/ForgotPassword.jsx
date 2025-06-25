import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    cvsuEmail: "",
    OTP: "",
    password: "",
    confirmPassword: "",
  });

  // FOR MODAL AND TOAST
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

  // SHOWING AND HIDING PASSWORD
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  const [passwordFeedback, setPasswordFeedback] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleClose = () => {
    setShow(false);
    setStep(1);
    setValues({
      cvsuEmail: "",
      OTP: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setSuccessMessage("");
  };

  const handleShow = () => setShow(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/send-otp`,
        {
          email: values.cvsuEmail,
        }
      );

      Swal.fire({
        icon: "success",
        // title: "OTP Sent",
        text: "OTP Sent, please check your email for the verification code.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      setStep(2);
    } catch (err) {
      Swal.fire({
        icon: "error",
        // title: "Failed to Send OTP",
        text:
          err.response?.data?.message || "Error sending OTP. Please try again.",
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify-otp`,
        {
          email: values.cvsuEmail,
          otp: values.OTP,
        }
      );

      Swal.fire({
        icon: "success",
        // title: "OTP Verified",
        text: "Your OTP has been successfully verified.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      setStep(3);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Invalid OTP. Please try again.";

      setError(errorMsg);

      Swal.fire({
        icon: "error",
        // title: "Verification Failed",
        text: `Verification failed, ${errorMsg}.`,
        timer: 4000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!values.password || !values.confirmPassword) {
      Swal.fire({
        icon: "warning",
        // title: "Missing Fields",
        text: "Please input password.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      Swal.fire({
        icon: "error",
        // title: "Mismatch",
        text: "Passwords do not match.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);
    // setError("");

    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/reset-password`,
        {
          email: values.cvsuEmail,
          password: values.password,
        }
      );

      Swal.fire({
        icon: "success",
        // title: "Password Reset",
        text: "Password reset successfully. You can now log in.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      // setTimeout(, 3000);
      handleClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Error resetting password. Please try again.";

      setError(errorMsg);

      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: errorMsg,
        toast: true,
        position: "top-end",
        timer: 4000,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { password, confirmPassword } = values;

    const feedback = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialchar: /[!@#$%^&*(),.?":{}|<>`~_+\-=\[\]\\;'/]/.test(password),
    };

    setPasswordFeedback(feedback);

    const strengthCount = Object.values(feedback).filter(Boolean).length;

    let strengthLabel;
    if (strengthCount <= 1) {
      strengthLabel = "Weak";
    } else if (strengthCount === 2 || strengthCount === 3) {
      strengthLabel = "Medium";
    } else if (strengthCount === 4) {
      strengthLabel = "Strong";
    }

    setPasswordStrength(strengthLabel);

    if (password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [values.password, values.confirmPassword]);

  return (
    <>
      <button
        type="button"
        className="my-1"
        onClick={handleShow}
        style={{ border: "none", backgroundColor: "transparent" }}
      >
        <p className="hoverUnderline m-0 text-light">Forgot Password?</p>
      </button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account Recovery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {step === 1 && (
            <div>
              <div className="mb-3">
                <input
                  type="email"
                  name="cvsuEmail"
                  placeholder="Enter your email"
                  className="form-control rounded"
                  value={values.cvsuEmail}
                  onChange={handleInputChange}
                  autoComplete="new-email"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p>
                One Time Password(OTP) sent to{" "}
                <span className="text-success">{values.cvsuEmail}</span>.
              </p>
              <div className="mb-3">
                <input
                  type="number"
                  name="OTP"
                  placeholder="Enter OTP"
                  className="form-control rounded"
                  value={values.OTP}
                  onChange={handleInputChange}
                  autoComplete="new-otp"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h5>Enter a new password.</h5>
              <div className="mb-3">
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New Password"
                    className="form-control rounded"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleInputChange}
                    required
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="position-absolute d-flex justify-content-center align-items-center"
                    style={{
                      width: "15px",
                      height: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      right: "15px",
                      cursor: "pointer",
                      zIndex: 5,
                      color: "var(--primary_hover)",
                    }}
                  >
                    <i
                      className={`${
                        showPassword ? "bx bx-show-alt" : "bx bx-hide"
                      }`}
                      style={{ fontSize: "clamp(1.2rem, 2dvw, 1.3rem)" }}
                    ></i>
                  </div>
                </div>

                <div className="mt-2">
                  <span
                    style={{
                      color:
                        passwordStrength === "Weak"
                          ? "red"
                          : passwordStrength === "Medium"
                          ? "orange"
                          : "green",
                    }}
                  >
                    {passwordStrength}
                  </span>
                </div>
                <div className="">
                  <p className="m-0">
                    Strength:
                    <span
                      className="ms-2"
                      style={{
                        color:
                          passwordStrength === "Weak"
                            ? "red"
                            : passwordStrength === "Medium"
                            ? "orange"
                            : "green",
                      }}
                    >
                      {passwordStrength}
                    </span>
                  </p>
                </div>
                <ul className="text-muted list-unstyled ">
                  <li
                    style={{
                      color: passwordFeedback.length ? "green" : "red",
                    }}
                  >
                    <p className="m-0">
                      {passwordFeedback.length ? (
                        <i className="bx bx-check"></i>
                      ) : (
                        <i className="bx bx-x"></i>
                      )}
                      At least 8 characters
                    </p>
                  </li>
                  <li
                    style={{
                      color: passwordFeedback.uppercase ? "green" : "red",
                    }}
                  >
                    <p className="m-0">
                      {passwordFeedback.uppercase ? (
                        <i className="bx bx-check"></i>
                      ) : (
                        <i className="bx bx-x"></i>
                      )}
                      At least one uppercase letter
                    </p>
                  </li>
                  <li
                    style={{
                      color: passwordFeedback.lowercase ? "green" : "red",
                    }}
                  >
                    <p className="m-0">
                      {passwordFeedback.lowercase ? (
                        <i className="bx bx-check"></i>
                      ) : (
                        <i className="bx bx-x"></i>
                      )}
                      At least one lowercase letter
                    </p>
                  </li>
                  <li
                    style={{
                      color: passwordFeedback.specialchar ? "red" : "green",
                    }}
                  >
                    <p className="m-0">
                      {passwordFeedback.specialchar ? (
                        <i className="bx bx-x"></i>
                      ) : (
                        <i className="bx bx-check"></i>
                      )}
                      Has no special character
                    </p>
                  </li>
                  <li
                    style={{
                      color: passwordFeedback.number ? "green" : "red",
                    }}
                  >
                    <p className="m-0">
                      {passwordFeedback.number ? (
                        <i className="bx bx-check"></i>
                      ) : (
                        <i className="bx bx-x"></i>
                      )}
                      At least one number
                    </p>
                  </li>
                </ul>
              </div>
              <div className="mb-3">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="form-control rounded"
                  value={values.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <div className="mt-2">
                  {passwordMatch === null ? (
                    ""
                  ) : passwordMatch ? (
                    <span style={{ color: "green" }}>Passwords match</span>
                  ) : (
                    <span style={{ color: "red" }}>Passwords do not match</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* {error && <div className="text-danger">{error}</div>}
          {successMessage && (
            <div className="text-success">{successMessage}</div>
          )} */}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={async () => {
              const result = await Swal.fire({
                title: "Are you sure?",
                text: "All progress will be lost.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, cancel",
                cancelButtonText: "No, don't cancel",
                reverseButtons: true,
              });

              if (result.isConfirmed) {
                handleClose(); // only run this if confirmed
              }
            }}
          >
            <p className="m-0">Close</p>
          </Button>
          {step === 1 && (
            <button
              className="primaryButton py-2"
              onClick={handleSendOTP}
              disabled={loading || values.cvsuEmail === ""}
            >
              <p className="m-0">
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {" Sending OTP"}
                  </>
                ) : (
                  "Send OTP"
                )}
              </p>
            </button>
          )}
          {step === 2 && (
            <button
              className="primaryButton py-2"
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              <p className="m-0">
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {" Verifying OTP"}
                  </>
                ) : (
                  "Verify OTP"
                )}
              </p>
            </button>
          )}
          {step === 3 && (
            <button
              className="primaryButton py-2"
              onClick={handleResetPassword}
              disabled={loading}
            >
              <p className="m-0">
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {" Resetting Password"}
                  </>
                ) : (
                  "Reset Password"
                )}
              </p>
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ForgotPassword;
