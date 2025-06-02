import React, { useState, useEffect, useRef } from "react";
import NavBarIndex from "../Layouts/NavBar/NavBarIndex";
import Background from "../Layouts/Background";
import sampleImage from "../../assets/Background.jpg";
import overlay from "../../assets/OverlayBackground.jpg";
import { PreLoader } from "./PreLoader";
import axios from "axios";
import IndexFooter from "../Layouts/IndexPage/IndexFooter";
import IndexCarousel from "../Layouts/IndexPage/IndexCarousel";
// import ExampleCarouselImage from "components/ExampleCarouselImage";

const IndexPage = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] = useState({});
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [reports, setReports] = useState([]);
  const [images, setImages] = useState([]);

  const [scrollUpButton, setScrollUpButton] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 700) {
        setScrollUpButton(true);
      } else {
        setScrollUpButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // USEREFS
  const Home = useRef(null);
  const Events = useRef(null);
  const MissionVision = useRef(null);
  const About = useRef(null);
  const Contacts = useRef(null);

  const ScrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const ScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchEntries();
    fetchReports();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/index-images"
        );
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get("http://localhost:8081/analytics");
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/getAddressReports"
      );
      setReports(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch reports";
      setError(errorMessage);
      console.error("Error fetching reports:", err);
    }
  };

  return (
    <>
      <PreLoader></PreLoader>

      {scrollUpButton && (
        <div
          className="position-fixed"
          style={{ right: "1rem", bottom: "1rem" }}
        >
          <button
            className="border-0 text-light rounded p-0 p-md-1 py-1 py-md-2"
            onClick={ScrollToTop}
            style={{ background: "var(--primary)" }}
          >
            <i
              class="bx bx-chevrons-up"
              style={{ fontSize: "clamp(2rem, 3dvw, 2.3rem)" }}
            ></i>
          </button>
        </div>
      )}

      <div ref={Home} className="" style={{}}>
        <NavBarIndex
          onNavigate={ScrollToSection}
          refs={{ Home, Events, MissionVision, About, Contacts }}
        ></NavBarIndex>

        <div className="d-flex flex-column gap-5" style={{ height: "100dvh" }}>
          {/* CAROUSEL */}
          <div className="shadow">
            <IndexCarousel images={images}></IndexCarousel>
          </div>

          {/* EVENTS AND ANNOUNCEMENTS */}
          <div
            ref={Events}
            className="mx-0 mx-md-4 p-3 p-md-4 d-flex flex-column gap-3 rounded shadow-sm"
            style={{ backgroundColor: "white", scrollMarginTop: "5rem" }}
          >
            <div
              className="rounded text-light py-3"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <h3 className="m-0">Events/Announcements</h3>
            </div>
            <div className="row gap-2">
              <div
                className="col-lg d-flex align-items-center"
                style={{ height: "clamp(20rem, 50dvw, 30rem)" }}
              >
                <img
                  className="rounded"
                  src={
                    latestAnnouncement && latestAnnouncement.diary_image
                      ? `http://localhost:8081${latestAnnouncement.diary_image}`
                      : sampleImage
                  }
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="col-lg d-flex flex-column align-items-center justify-content-center gap-2">
                <h4
                  className="m-0 px-2 mt-2 mt-md-0"
                  // style={{ borderBottom: ".2rem solid var(--primary)" }}
                >
                  {latestAnnouncement.title}
                </h4>
                <p
                  className="m-0 text-secondary overflow-y-scroll custom-scrollbar"
                  style={{ maxHeight: "clamp(12rem, 20dvw, 20rem)" }}
                >
                  {latestAnnouncement.description}
                </p>
              </div>
            </div>
          </div>

          {/* STATISTICS */}
          <div className="row gap-2 mx-1 mx-sm-4 rounded">
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">{users.length}</h1>
              <h5 className="m-0">Users</h5>
            </div>
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">{entries.length}</h1>
              <h5 className="m-0">Posted Diaries</h5>
            </div>
            <div
              className="col-md rounded text-light py-3 shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <h1 className="m-0">{reports.length}</h1>
              <h5 className="m-0">Addressed Cases</h5>
            </div>
          </div>

          {/* MISSION AND VISION */}
          <div
            ref={MissionVision}
            className="mx-0 mx-md-4 px-2 rounded"
            style={{ scrollMarginTop: "10rem" }}
          >
            <div className="row gap-2 px-1">
              <div
                className="col-md p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h2
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Mission
                </h2>
                <h5 className="m-0 fw-bold text-secondary">
                  A gender responsive educational institution where stakeholders
                  enjoy equal responsibilities and opportunities.
                </h5>
              </div>
              <div
                className="col-md p-4 rounded shadow-sm"
                style={{ backgroundColor: "white" }}
              >
                <h2
                  className="m-0 mb-3 pb-3 fw-bolder"
                  style={{
                    borderBottom: ".2rem solid var(--secondary)",
                    color: "var(--primary)",
                  }}
                >
                  Vision
                </h2>
                <h5 className="m-0 fw-bold text-secondary">
                  CvSU–GAD Resource Center shall integrate and advocate gender
                  equity and equality principles and perspectives in providing
                  instruction, research and extension services.
                </h5>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div
            ref={About}
            className="mx-0 mx-md-4 rounded p-3 p-md-5 shadow-sm"
            style={{ backgroundColor: "white", scrollMarginTop: "6rem" }}
          >
            <div className="d-flex flex-column gap-4">
              <h2
                className="m-0 d-flex align-items-center gap-1 text-start text-light py-3 px-3 rounded"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <i class="bx bx-info-circle"></i>
                About
              </h2>
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
          <div ref={Contacts}>
            <IndexFooter></IndexFooter>
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
