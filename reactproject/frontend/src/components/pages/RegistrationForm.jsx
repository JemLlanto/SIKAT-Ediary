import { useState, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

const RegistrationForm = () => {
  return (
    <div
      className=" mb-3 position-relative py-2 "
      style={{ width: "clamp(450px, 80vw, 650px)" }}
    >
      <div
        className="position-absolute w-100"
        style={{ top: "50%", transform: "translateY(-50%)", zIndex: "-1" }}
      >
        <ProgressBar
          now={progressPercent}
          className="custom-progress-bar"
          animated
        />
      </div>
      <div className="d-flex justify-content-between">
        <div
          className={`stepsIndicator ${step === 1 ? "active" : ""}`}
          style={{
            backgroundColor: step >= 1 ? "var(--primary)" : "lightgray",
            color: step >= 1 ? "#ffff" : "gray",
          }}
        >
          <h5>1</h5>
        </div>
        <div
          className={`stepsIndicator ${step === 2 ? "active" : ""}`}
          style={{
            backgroundColor: step >= 2 ? "var(--primary)" : "lightgray",
            color: step >= 2 ? "#ffff" : "gray",
          }}
        >
          <h5>2</h5>
        </div>
        <div
          className={`stepsIndicator ${step === 3 ? "active" : ""}`}
          style={{
            backgroundColor: step === 3 ? "var(--primary)" : "lightgray",
            color: step >= 3 ? "#ffff" : "gray",
          }}
        >
          <h5>3</h5>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
