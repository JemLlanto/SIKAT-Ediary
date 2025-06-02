import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBarIndex from "../Layouts/NavBar/NavBarIndex";
import Background from "../Layouts/Background";
import Login from "./Login";
import Register from "./Register";
import Logo from "../../assets/logo.jpg";
import BackgroundImg1 from "../../assets/LogInBackground (1).png";
import BackgroundImg2 from "../../assets/LogInBackground (2).png";
import TextLogo from "../../assets/TextLogo.png";
import TransparentLogo from "../../assets/TransparentLogo.png";
import sampleImage from "../../assets/Background.jpg";
import overlay from "../../assets/OverlayBackground.jpg";
import { PreLoader } from "./PreLoader";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import { over } from "lodash";
// import ExampleCarouselImage from "components/ExampleCarouselImage";

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
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <>
      <PreLoader></PreLoader>

      <div className=" vh-100">
        <NavBarIndex></NavBarIndex>

        <div
          className="mt-4 d-flex flex-column gap-5"
          style={{ height: "100dvh" }}
        >
          {/* CAROUSEL */}
          <div className="mt-5">
            <Carousel activeIndex={index} onSelect={handleSelect}>
              <Carousel.Item>
                <div className="carouselBlackFade"></div>
                <img src={sampleImage} alt="" />
                <Carousel.Caption>
                  <h3>First slide label</h3>
                  <p>
                    Nulla vitae elit libero, a pharetra augue mollis interdum.
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <div className="carouselBlackFade"></div>
                <img src={sampleImage} alt="" />
                <Carousel.Caption>
                  <h3>Second slide label</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <div className="carouselBlackFade"></div>
                <img src={sampleImage} alt="" />
                <Carousel.Caption>
                  <h3>Third slide label</h3>
                  <p>
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur.
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          </div>

          {/* EVENTS AND ANNOUNCEMENTS */}
          <div
            className="mx-4 p-4 d-flex flex-column gap-3 rounded shadow-sm"
            style={{ backgroundColor: "white" }}
          >
            <div
              className="rounded text-light py-3"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <h2 className="m-0">Events/Announcements</h2>
            </div>
            <div className="row gap-2">
              <div
                className="col-lg d-flex align-items-center"
                style={{ minHeight: "clamp(20rem, 50dvw, 30rem)" }}
              >
                <img
                  className="rounded"
                  src={sampleImage}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="col-lg d-flex flex-column align-items-center justify-content-center gap-2">
                <h4
                  className="m-0 px-2"
                  // style={{ borderBottom: ".2rem solid var(--primary)" }}
                >
                  Sample Title Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Commodi assumenda quidem velit corporis ex
                  rem eaque illo ipsum placeat? Iure?
                </h4>
                <p className="m-0 text-secondary">
                  Sample Description. Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Quaerat itaque, reiciendis adipisci
                  doloremque sit iste. Harum vero sunt ab facilis. Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. In voluptates
                  enim earum, reiciendis quis obcaecati amet cumque id delectus
                  nemo totam porro dolorem, nam est? Officia fugit, quidem
                  officiis sit, nihil at, sed exercitationem autem est
                  laboriosam qui ab minus.
                </p>
              </div>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="row gap-2 mx-4 rounded">
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">00</h1>
              <h5 className="m-0">Users</h5>
            </div>
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">00</h1>
              <h5 className="m-0">Posted Diaries</h5>
            </div>
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">00</h1>
              <h5 className="m-0">Resolved Cases</h5>
            </div>
          </div>

          {/* GOALS, OBJECTIVES, MISSION AND VISION */}
          <div className="d-flex flex-column gap-2 mx-4 px-2 rounded">
            {/* MISSION VISION */}
            <div className="row gap-2 px-1">
              <div
                className="col-md p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h1
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Mission
                </h1>
                <h5 className="m-0 fw-bold text-secondary">
                  A gender responsive educational institution where stakeholders
                  enjoy equal responsibilities and opportunities.
                </h5>
              </div>
              <div
                className="col-md p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h1
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Vision
                </h1>
                <h5 className="m-0 fw-bold text-secondary">
                  CvSU–GAD Resource Center shall integrate and advocate gender
                  equity and equality principles and perspectives in providing
                  instruction, research and extension services.
                </h5>
              </div>
            </div>
            {/* GOALS AND OBJECTIVES */}
            <div className="row gap-2 px-1 text-start">
              <div
                className=" p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h1
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Goals
                </h1>
                <h5 className="m-0 fw-bold text-secondary">
                  The GAD Resource Center shall aim for:
                  <ol>
                    <li>
                      Sustainable and gender responsive instruction, research,
                      community development and involvement;
                    </li>
                    <li>
                      Gender equity and equality among the academic community;
                    </li>
                    <li>
                      Sustainable partnership and cooperation among
                      stakeholders; and
                    </li>
                    <li>Gender responsive governance.</li>
                  </ol>
                </h5>
              </div>
              <div
                className="p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h1
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Objectives
                </h1>
                <h5 className="m-0 fw-bold text-secondary">
                  <ol style={{ gap: "1rem" }}>
                    <li>
                      Strengthen the capacity of faculty members in the
                      integration of GAD and other issues and concerns in the
                      course syllabi and instructional materials;
                    </li>
                    <li>
                      Enhance data and information on women’s participation in
                      politics, economics, education, peace and order and other
                      activities, and disseminate information to clients;
                    </li>
                    <li>
                      Improve level of understanding, awareness, and
                      responsiveness of residents of the community and members
                      of other organizations on GAD issues and concerns and laws
                      on women;
                    </li>
                    <li>
                      Establish a repository for gender-related instruction,
                      research, and extension materials and other forms of
                      literature on gender and development;
                    </li>
                    <li>
                      Strengthen accessibility of men and women to knowledge
                      management products, resources and networks;
                    </li>
                    <li>
                      Establish networks and linkages with other local,
                      national, and international organizations;
                    </li>
                    <li>
                      Ensure that the sex-disaggregated data and other vital
                      information obtained from its operations shall be used as
                      basis in decision making processes; and
                    </li>
                    <li>
                      Sustain the gender mainstreaming efforts of the
                      University.
                    </li>
                  </ol>
                </h5>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div
            className="mx-4 rounded p-5 shadow-sm"
            style={{ backgroundColor: "white" }}
          >
            <div className="d-flex flex-column gap-4">
              <h1
                className="m-0 d-flex align-items-center gap-1 text-start text-light py-3 px-3 rounded"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <i class="bx bx-info-circle"></i>
                About
              </h1>
              <h4
                className="m-0 mx-3 text-secondary text-start fw-lighter"
                style={{ wordWrap: "break-word", whiteSpace: "pre-wrap" }}
              >
                The SIKAT eDiary is designed to address critical issues faced by
                stakeholders at CvSU-CCAT, especially those affected by Republic
                Act 9262 (The Violence Against Women and Children Act). This
                online diary provides a secure platform where victims can:
                <ol className="my-4">
                  <li>Share their experiences safely.</li>
                  <li>Seek help and support.</li>
                  <li>Connect with support communities.</li>
                </ol>
                By leveraging the internet's wide reach and anonymity, the SIKAT
                eDiary empowers victims to express themselves freely and access
                essential resources and assistance. Ultimately, the project aims
                to build a safer and more supportive community.
              </h4>
            </div>
          </div>

          {/* FOOTER */}
          <div>
            <div
              style={{
                height: "20rem",
                backgroundColor: "#0f001a",
              }}
            >
              <div className="row p-5" style={{ height: "100%" }}>
                <div className="col-md-3 d-flex align-items-center">
                  <img
                    src={TextLogo}
                    alt=""
                    style={{
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div className="col-md">CONTACTS</div>
              </div>
            </div>
          </div>
        </div>
        <Background>
          <div className="vh-100 position-sticky" style={{ opacity: ".08" }}>
            <img
              src={overlay}
              alt=""
              style={{ height: "100% ", width: "100%", objectFit: "cover" }}
            />
          </div>
        </Background>
      </div>
    </>
  );
};

export default IndexPage;
