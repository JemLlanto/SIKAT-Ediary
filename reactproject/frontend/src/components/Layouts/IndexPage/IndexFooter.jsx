import React from "react";
import TextLogo from "../../../assets/TextLogo.png";

const IndexFooter = () => {
  return (
    <div
      style={{
        minHeight: "15rem",
        backgroundColor: "#0f001a",
      }}
    >
      <div className="row p-5 text-light" style={{ width: "100%" }}>
        <div className="col-md-3 ps-md-5 d-flex justify-content-center align-items-center">
          <img
            src={TextLogo}
            alt=""
            style={{
              width: "clamp(10rem, 25dvw, 20rem)",
              objectFit: "cover",
            }}
          />
        </div>
        <div className="col-md">
          <div className="row ps-md-5 pt-4 text-center text-md-start">
            <div className="col-md">
              <h5
                className="m-0 pb-3 mb-4"
                style={{ borderBottom: ".1rem solid var(--secondary)" }}
              >
                CONTACTS
              </h5>
              <p>EMAIL: gadccat@cvsu-rosario.edu.ph</p>
            </div>
            <div className="col-md">
              <h5
                className="m-0 pb-3 mb-4"
                style={{ borderBottom: ".1rem solid var(--secondary)" }}
              >
                SOCIALS
              </h5>
              <p>
                FB:{" "}
                <a
                  className="text-decoration-none text-light"
                  href="https://www.facebook.com/gadccat"
                >
                  CvSU - CCAT Gender and Development
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-top border-light py-3 text-light">
        <p className="m-0">Copyright © 2024 | All rights reserved</p>
      </div>
    </div>
  );
};

export default IndexFooter;
