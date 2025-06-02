import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoginValidation from "./LoginValidation";
import logo from "../../assets/TransparentLogo.png";
import ForgotPassword from "./ForgotPassword";
import { Modal } from "react-bootstrap";

export default function Login() {
  const [values, setValues] = useState({
    cvsuEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [suspendModal, setSuspendModal] = useState(false);
  const closeSuspendModal = () => {
    setSuspendModal(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      navigate("/Home");
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = LoginValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setServerError("");
      axios
        .post("http://localhost:8081/Login", values)
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          if (res.data.isAdmin) {
            navigate("/Admin/Home");
          } else {
            navigate("/Home");
          }
        })
        .catch((err) => {
          console.error("Login Error:", err);
          setServerError(
            err.response?.data?.error ||
              "Invalid login credentials. Please try again."
          );
        })
        .finally(() => setLoading(false));
    }
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center px-2">
      <div
        className="rounded-5 shadow p-4 fade-up"
        style={{
          width: "clamp(400px, 40vw, 400px)",
          backgroundColor: "var(--primary)",
        }}
      >
        <div className="d-flex flex-column align-items-center" style={{}}>
          <Link to="/">
            <img src={logo} alt="" style={{ width: "65px", height: "65px" }} />
          </Link>
          {/* <div>
            <img
              src={TextLogo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div> */}

          <h3
            className="m-0 text-light"
            style={{ fontSize: "clamp(20px, 3vw, 25px)", color: "#ffff" }}
          >
            Welcome to
          </h3>
          <h1
            className="m-0 mb-4 fw-bolder"
            style={{
              fontSize: "clamp(40px, 3vw, 60px)",
              color: "var(--secondary)",
            }}
          >
            SIKAT eDiary
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="input-group mb-2">
            <span className="input-group-text p-1 px-2">
              <i
                class="bx bxs-user-circle bx-sm my-1"
                style={{ color: "var(--primary_hover)" }}
              ></i>
            </span>
            <input
              type="email"
              name="cvsuEmail"
              placeholder="CvSU Email"
              onChange={handleInput}
              className="form-control rounded-end"
              value={values.cvsuEmail}
              disabled={loading}
            />
          </div>
          {errors.cvsuEmail && (
            <span className="text-danger">{errors.cvsuEmail}</span>
          )}

          {/* Password field */}
          <div className="input-group position-relative">
            <span className="input-group-text p-1 px-2">
              <i
                class="bx bxs-lock bx-sm my-1"
                style={{ color: "var(--primary_hover)" }}
              ></i>
            </span>
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              name="password"
              placeholder="Password"
              onChange={handleInput}
              className="form-control rounded-end pe-5"
              value={values.password}
              disabled={loading}
            />
            <div
              onClick={togglePasswordVisibility} // Toggle password visibility
              style={{
                cursor: "pointer",
                zIndex: 5,
                position: "relative",
                color: "var(--primary_hover)",
              }}
            >
              <div
                className="position-absolute d-flex justify-content-center align-items-center"
                style={{
                  width: "15px",
                  height: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: "15px",
                }}
              >
                <i
                  className={`${
                    showPassword ? "bx bx-show-alt" : "bx bx-hide"
                  }`}
                  style={{ fontSize: "clamp(1.2rem, 2dvw, 1.5rem)" }}
                ></i>
              </div>
            </div>
          </div>
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}

          {serverError && <span className="text-danger">{serverError}</span>}

          {/* {serverError && (
            <Modal show={!!serverError} onHide={closeSuspendModal} centered>
              <Modal.Header CloseButton>
                <Modal.Title className="text-danger text-center">
                  {serverError}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body></Modal.Body>
            </Modal>
          )} */}

          <div className="text-end my-2">
            <ForgotPassword></ForgotPassword>
          </div>

          <button
            type="submit"
            className="orangeButton rounded w-100 py-2"
            disabled={loading}
          >
            <h5 className="m-0">
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {" Loging in..."}
                </>
              ) : (
                "Log in"
              )}
            </h5>
          </button>
        </form>
      </div>
    </div>
  );
}
