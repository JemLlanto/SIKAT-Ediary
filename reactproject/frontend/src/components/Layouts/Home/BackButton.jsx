import React from "react";
import { Link, useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <Link
      className="backButton position-fixed text-decoration-none text-light rounded-circle d-flex align-items-center justify-content-center mt-5 mt-lg-0 d-none d-md-flex"
      style={{
        width: "clamp(2.5rem, 5dvw, 3.2rem)",
        height: "clamp(2.5rem, 5dvw, 3.2rem)",
        backgroundColor: "var(--primary)",
        fontSize: "clamp(1.1rem, 5dvw, 1.5rem)",
        top: "5rem",
        left: "1rem",
      }}
      onClick={() => navigate(-1)}
    >
      <i class="bx bx-arrow-back"></i>
    </Link>
  );
};

export default BackButton;
