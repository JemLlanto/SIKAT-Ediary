import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import IndexNavBar from "../Layouts/NavBar/NavBarIndex";
import Background from "../Layouts/Background";
import Login from "./Login";
import Register from "./Register";
import Logo from "../../assets/logo.jpg";
import BackgroundImg1 from "../../assets/LogInBackground (1).png";
import BackgroundImg2 from "../../assets/LogInBackground (2).png";
import TextLogo from "../../assets/TextLogo.png";
import TransparentLogo from "../../assets/TransparentLogo.png";
import sampleImage from "../../assets/Background.jpg";
import { PreLoader } from "./PreLoader";
import axios from "axios";

const IndexPage = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get("http://localhost:8081/announcement");

        if (response.status === 200) {
          setLatestAnnouncement(response.data);
        } else {
          console.error("No announcement found");
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    fetchAnnouncement();
  }, []);

  const handleLoginClick = () => {
    if (!isLoginPage) {
      setFadeIn(false);
      setTimeout(() => {
        setIsLoginPage(true);
        setFadeIn(true);
      }, 200);
    }
  };

  const handleRegisterClick = () => {
    if (isLoginPage) {
      setFadeIn(false);
      setTimeout(() => {
        setIsLoginPage(false);
        setFadeIn(true);
      }, 200); // duration of the fade-out animation
    }
  };

  return (
    <>
      <PreLoader></PreLoader>

      <div className=" vh-100">
        <div className="position-relative vh-100 d-flex flex-column justify-content-start align-items-center pt-3">
          <div className="w-100 mb-2 " style={{ top: "0" }}>
            <div>
              <img
                src={TransparentLogo}
                alt=""
                style={{ width: "clamp(3.5rem, 5vw, 5rem)" }}
              />
              <img
                src={TextLogo}
                alt=""
                style={{ width: "clamp(6rem, 10vw, 10rem)" }}
              />
            </div>
          </div>

          <div
            className="position-relative d-flex flex-column align-items-center gap-2"
            style={{ width: "80dvw" }}
          >
            <div
              className="row position-relative rounded overflow-hidden bg-light"
              style={{ width: "", minHeight: "60vh" }}
            >
              <div className="col-lg p-2" style={{ width: "%" }}>
                {latestAnnouncement ? (
                  <img
                    className="rounded"
                    src={
                      latestAnnouncement.diary_image
                        ? `http://localhost:8081${latestAnnouncement.diary_image}`
                        : sampleImage
                    }
                    alt=""
                    style={{
                      width: "70%",
                      height: "100%",
                      objectFit: "fill",
                    }}
                  />
                ) : (
                  <p className="text-secondary">No announcements available.</p>
                )}
              </div>
              <div
                className="col-lg d-flex flex-column justify-content-between text-center text-lg-start p-3 pt-3"
                style={{ width: "%" }}
              >
                <div>
                  <h3
                    className="rounded py-1 ps-2"
                    style={{ backgroundColor: "var(--secondary)" }}
                  >
                    Events & Announcements
                  </h3>
                  <h5>Post Title</h5>
                  <div
                    className="overflow-y-scroll custom-scrollbar mb-2"
                    style={{ height: "clamp(13rem, 20dvw, 17rem)" }}
                  >
                    <p>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                      Maxime magni incidunt velit assumenda ad excepturi natus
                      inventore ducimus. Incidunt aliquam voluptates
                      voluptatibus voluptate deserunt asperiores dolore eligendi
                      ut vero at.Lorem, ipsum dolor sit amet consectetur
                      adipisicing elit. Maxime magni incidunt velit assumenda ad
                      excepturi natus inventore ducimus. Incidunt aliquam
                      voluptates voluptatibus voluptate deserunt asperiores
                      dolore eligendi ut vero at.Lorem, ipsum dolor sit amet
                      consectetur adipisicing elit. Maxime magni incidunt velit
                      assumenda ad excepturi natus inventore ducimus. Incidunt
                      aliquam voluptates voluptatibus voluptate deserunt
                      asperiores dolore eligendi ut vero at.
                    </p>
                  </div>
                </div>
                <div className="" style={{ right: "1rem", top: "1rem" }}>
                  <Link to="/Login">
                    <button className="w-100 primaryButton text-light px-5 py-2">
                      <h5 className="m-0">Log In</h5>
                    </button>
                  </Link>
                </div>
              </div>
              {/* <div
                  className="w-100 position-absolute d-flex align-items-end justify-content-center"
                  style={{
                    background:
                      "linear-gradient(to top, rgb(38, 38, 38,.8), rgb(38, 38, 38,.0))",
                    bottom: "0",
                    height: "7rem",
                  }}
                >
                  <h5 className="text-light">Latest Announcement</h5>
                </div> */}
            </div>
            <div className="row gap-2">
              <div
                className="col-md border shadow rounded bg-light p-2"
                style={{ width: "100%", minHeight: "20vh" }}
              >
                <h5
                  className="rounded py-1"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  Mision
                </h5>
                <p>
                  A gender responsive educational institution where stakeholders
                  enjoy equal responsibilities and opportunities.
                </p>
              </div>
              <div
                className="col-md border shadow rounded bg-light p-2"
                style={{ width: "100%", minHeight: "20vh" }}
              >
                <h5
                  className="rounded py-1"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  Vision
                </h5>

                <p>
                  CvSU–GAD Resource Center shall integrate and advocate gender
                  equity and equality principles and perspectives in providing
                  instruction, research and extension services.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Background>
          <div className="vh-100 position-relative">
            <div>
              <img
                className="position-absolute"
                src={BackgroundImg1}
                alt=""
                style={{
                  left: "0",
                  top: "0px",
                  width: "clamp(30rem, 90vw, 90rem)",
                }}
              />
            </div>
            <div>
              <img
                className="position-absolute"
                src={BackgroundImg2}
                alt=""
                style={{
                  right: "0",
                  bottom: "0px",
                  width: "clamp(30rem, 90vw, 90rem)",
                }}
              />
            </div>
            <div
              className="vh-100"
              style={{ backgroundColor: "var(--primary)" }}
            ></div>
          </div>
        </Background>
      </div>
    </>
  );
};

export default IndexPage;
