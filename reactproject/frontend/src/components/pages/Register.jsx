import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterValidation from "./RegisterValidation";
import axios from "axios";
// import ProgressBar from "react-bootstrap/ProgressBar";
import { Alert } from "react-bootstrap"; // Import Bootstrap Alert
import MessageModal from "../Layouts/DiaryEntry/messageModal";
import MessageAlert from "../Layouts/DiaryEntry/messageAlert";
import ProgressBarLayout from "../Layouts/Registration/ProgressBarLayout";
import Step1 from "../Layouts/Registration/Step1";
import Step2 from "../Layouts/Registration/Step2";
import Step3 from "../Layouts/Registration/Step3";
import Swal from "sweetalert2";

export default function Register() {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    cvsuEmail: "",
    alias: "",
    studentNumber: "",
    username: "",
    password: "",
    confirmPassword: "",
    OTP: "",
    sex: "",
    course: "",
    year: "",
  });

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // OTP sent status
  const [otpError, setOtpError] = useState(""); // OTP error message
  const [resendCountdown, setResendCountdown] = useState(60); // Resend countdown

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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      navigate("/Home");
    }
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (otpSent && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendCountdown]);

  const validateEmail = async (cvsuEmail, username) => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/check-email-username`,
        {
          username,
          cvsuEmail,
        },
      );
      if (response.data.exists) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "This username is already taken.",
          cvsuEmail: "This email is already registered.",
        }));
        setShowAlert(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        username: "Error checking username. Please try again later.",
        cvsuEmail: "Error checking email. Please try again later.",
      }));
      setShowAlert(true);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // console.log("Form submitted, current step:", step);

    if (step === 3) {
      // console.log("Verifying OTP for email:", values.cvsuEmail);

      try {
        Swal.fire({
          title: "Verifying OTP...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify-otp`,
          {
            email: values.cvsuEmail,
            otp: values.OTP,
          },
        );

        if (response.data.success) {
          Swal.fire({
            icon: "success",
            // title: "OTP Verified",
            text: "OTP Verified, Registering user...",
            showConfirmButton: false,
            timer: 1500,
          });

          try {
            await axios.post(
              `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/Register`,
              values,
            );

            Swal.fire({
              icon: "success",
              // title: "Registration Successful",
              text: "Registration Successful, Redirecting...",
              timer: 2000,
              showConfirmButton: false,
            });

            setTimeout(() => {
              window.location.reload();
              // navigate("/Login");
            }, 2000);
          } catch (err) {
            const errorMsg =
              err.response?.data?.error || "Invalid OTP. Please try again.";
            console.error("Error during registration:", err);
            Swal.fire({
              icon: "error",
              // title: "Registration Failed",
              text: `Verification failed, ${errorMsg}.`,
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            // title: "Invalid OTP",
            text: "Incorrect OTP. Please try again.",
          });
        }
      } catch (err) {
        console.error("Error during OTP verification:", err);
        Swal.fire({
          icon: "error",
          // title: "OTP Verification Failed",
          text: "OTP Verification Failed, Please try again later.",
        });
      }
    } else if (step === 2) {
      // console.log("Step 2: Validating registration fields...");
      const validationErrors = RegisterValidation(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        const isEmailValid = await validateEmail(values.cvsuEmail);
        if (isEmailValid) {
          // console.log("Validation passed, sending OTP...");

          Swal.fire({
            icon: "info",
            // title: "Sending OTP",
            text: "Sending OTP, Please wait while we send a verification code to your email.",
            showConfirmButton: false,
            timer: 2000,
          });

          sendOTP(values.cvsuEmail);
          setStep(step + 1);
        } else {
          Swal.fire({
            icon: "error",
            // title: "Invalid Email",
            text: "Invalid Email, The email format or domain is invalid.",
          });
        }
      } else {
        // console.log("Validation errors:", validationErrors);
        Swal.fire({
          icon: "warning",
          // title: "Incomplete Fields",
          text: "Incomplete Fields, Please fill in all required fields correctly.",
        });
      }
    } else {
      setStep(step + 1);
    }
  };

  const sendOTP = async (email) => {
    // console.log("Sending OTP to:", email);

    // Show loading state using SweetAlert2
    Swal.fire({
      // title: "Sending OTP...",
      text: `Sending OTP to ${email}`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/send-register-otp`,
        { email },
      );

      // console.log("OTP sent response:", response.data);
      setOtpSent(true);
      setResendCountdown(60);

      // Show success alert
      Swal.fire({
        icon: "success",
        // title: "OTP Sent",
        text: "OTP Sent, Please check your email for the verification code.",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Show error alert
      Swal.fire({
        icon: "error",
        // title: "Failed to Send OTP",
        text:
          error.response?.data?.message ||
          "Please check your internet connection and try again.",
      });
    }
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getCourses`)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  const progressPercent = step === 1 ? 0 : step === 2 ? 50 : 100;

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center flex-column pt-2">
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

      {/* FOR PROGRESS BAR */}
      <ProgressBarLayout step={step} progressPercent={progressPercent} />

      <div
        className="bg-white rounded border border-secondary-subtle shadow text-start p-3 "
        style={{
          width: "clamp(18.5rem, 80vw, 40rem)",
          minHeight: "15rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <form
          className="h-100 d-flex flex-column justify-content-between"
          action=""
          onSubmit={handleSubmit}
        >
          <div>
            <div className="border-bottom pb-1 mb-2">
              <h3 className="m-0" style={{ color: "var(--primary)" }}>
                Create New Account
              </h3>
              <p className="m-0 text-secondary">
                Easily establish your account in just a few steps.
              </p>
            </div>

            {/* Error Alert */}
            {showAlert && Object.keys(errors).length > 0 && (
              <Alert
                variant="danger"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                <ul className="mb-0">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>
                      <p className="m-0">{message}</p>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Personal Details - Step 1 */}
            {step === 1 && (
              <>
                <Step1
                  values={values}
                  handleInput={handleInput}
                  courses={courses}
                />
              </>
            )}

            {/* Account Details - Step 2 */}
            {step === 2 && (
              <>
                <Step2 values={values} handleInput={handleInput} />
              </>
            )}

            {step === 3 && (
              <div className="form-section active mb-2">
                <h5>Account Verification</h5>
                {otpSent ? (
                  <div>
                    <p className="m-0">
                      An OTP has been sent to{" "}
                      <span className="text-success">{values.cvsuEmail}</span>
                    </p>
                    <input
                      type="number"
                      name="OTP"
                      placeholder="Enter OTP"
                      className="form-control"
                      onChange={handleInput}
                      value={values.OTP}
                    />
                    {/* {otpError && <p style={{ color: "red" }}>{otpError}</p>} */}
                    <div className="text-end">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission when clicking the resend OTP button
                          sendOTP(values.cvsuEmail);
                        }}
                        className="btn btn-link"
                        disabled={resendCountdown > 0} // Disable if countdown is active
                      >
                        <p className="m-0">
                          Resend OTP{" "}
                          <span>
                            {resendCountdown > 0 && `(${resendCountdown}s)`}
                          </span>
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>Sending OTP...</p>
                )}
              </div>
            )}
          </div>

          <div
            className="w-100 d-flex justify-content-between"
            style={{ bottom: "0", left: "0" }}
          >
            <button
              type="button"
              className="w-25 btn btn-secondary px-0"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <h5 className="m-0">Back</h5>
            </button>

            <button type="submit" className="w-25 primaryButton p-0">
              <h5 className="m-0">{step === 3 ? "Register" : "Next"}</h5>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
