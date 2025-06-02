import { React, useState, useEffect } from "react";

const Step2 = ({ values, handleInput }) => {
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
    specialchar: false,
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(null);

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
    <div
      className={`form-section active`}
      style={{
        transform: `translateX(0)`,
        transition: "all 0.5s ease-in-out",
      }}
    >
      <h5>Account Security Details</h5>
      <div className="mb-3">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleInput}
          className="form-control rounded"
          value={values.username}
          autoComplete="new-username"
          style={{ display: "none" }}
        />
      </div>

      <div>
        <label>Password</label>
        <div className="position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleInput}
            className="form-control"
            placeholder="Enter your password"
            autoComplete="new-password"
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
              className={`${showPassword ? "bx bx-show-alt" : "bx bx-hide"}`}
              style={{ fontSize: "clamp(1.2rem, 2dvw, 1.3rem)" }}
            ></i>
          </div>
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
                <i class="bx bx-check"></i>
              ) : (
                <i class="bx bx-x"></i>
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
                <i class="bx bx-check"></i>
              ) : (
                <i class="bx bx-x"></i>
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
                <i class="bx bx-check"></i>
              ) : (
                <i class="bx bx-x"></i>
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
                <i class="bx bx-x"></i>
              ) : (
                <i class="bx bx-check"></i>
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
                <i class="bx bx-check"></i>
              ) : (
                <i class="bx bx-x"></i>
              )}
              At least one number
            </p>
          </li>
        </ul>
      </div>

      {/* Confirm Password Field */}
      <div className="mt-3">
        <label>Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleInput}
          className="form-control"
          placeholder="Re-enter your password"
          required
        />
      </div>

      <div className="mb-2">
        <p className="m-0">
          {passwordMatch === null ? (
            ""
          ) : passwordMatch ? (
            <span style={{ color: "green" }}>Passwords match</span>
          ) : (
            <span style={{ color: "red" }}>Passwords do not match</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Step2;
