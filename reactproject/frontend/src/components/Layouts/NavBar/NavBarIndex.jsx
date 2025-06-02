import "../style.css";
import Logo from "../../../assets/Logo.jpg";
import TextLogo from "../../../assets/TextLogo.png";
import { Link, useNavigate } from "react-router-dom";

const NavBarIndex = ({ onNavigate, refs }) => {
  const { Home, Events, MissionVision, About, Contacts } = refs;
  return (
    <nav
      class="navbar navbar-expand-lg p-0 position-sticky"
      style={{ top: "0" }}
    >
      <div class="container-fluid d-flex flex-column justify-content-center flex-md-row gap-2 py-2 px-3 shadow-sm">
        <div className="w-100 row gap-2 gap-lg-0">
          <div className="col-lg-2 d-flex justify-content-between justify-content-lg-start align-items-center gap-2 px-0 px-md-2">
            <div className="  d-flex align-items-center gap-2">
              <div className="logo">
                <Link to={"/"}>
                  <img className="logoImage" src={Logo} alt="Logo" />
                </Link>
              </div>
              <div className="TextLogo d-flex align-items-center">
                <Link to={"/"}>
                  <img src={TextLogo} alt="" style={{ height: "2.5rem" }} />
                </Link>
              </div>
            </div>

            <Link
              className="d-block d-lg-none"
              to="/Login"
              style={{ minWidth: "6rem" }}
            >
              <button className="w-100 orangeButton px-4 py-2 py-lg-2">
                <p className="m-0 text-dark fw-bold">Log in</p>
              </button>
            </Link>
          </div>
          <div className="col-lg d-flex justify-content-center justify-content-lg-end align-items-center gap-4 py-2 py-md-1 py-lg-0">
            <div className="w-100 d-flex align-items-center justify-content-between justify-content-lg-end text-light">
              <div onClick={() => onNavigate(Home)}>
                <h3 className="m-0 d-flex align-items-center justify-content-center d-block d-md-none">
                  <i class="bx bx-home-alt"></i>
                </h3>
                <p className="navText m-0 py-2 d-none d-md-block">Home</p>
              </div>
              <div onClick={() => onNavigate(Events)}>
                <h3 className="m-0 d-flex align-items-center justify-content-center d-block d-md-none">
                  <i class="bx bxs-megaphone"></i>
                </h3>
                <p className="navText m-0 py-2 d-none d-md-block">
                  Events/Announcements
                </p>
              </div>
              <div onClick={() => onNavigate(MissionVision)}>
                <h3 className="m-0 d-flex align-items-center justify-content-center d-block d-md-none">
                  <i class="bx bx-list-check"></i>
                </h3>
                <p className="navText m-0 py-2 d-none d-md-block">
                  Mission/Vision
                </p>
              </div>
              <div onClick={() => onNavigate(About)}>
                <h3 className="m-0 d-flex align-items-center justify-content-center d-block d-md-none">
                  <i class="bx bx-info-circle"></i>
                </h3>
                <p className="navText m-0 py-2 d-none d-md-block">About Us</p>
              </div>
              <div onClick={() => onNavigate(Contacts)}>
                <h3 className="m-0 d-flex align-items-center justify-content-center d-block d-md-none">
                  <i class="bx bx-phone-call"></i>
                </h3>
                <p className="navText m-0 py-2 d-none d-md-block">Contact Us</p>
              </div>
            </div>

            <Link
              className="d-none d-lg-block"
              to="/Login"
              style={{ minWidth: "6rem" }}
            >
              <button className="w-100 orangeButton px-4 py-md-2 py-lg-2">
                <p className="m-0 text-dark fw-bold">Log in</p>
              </button>
            </Link>

            {/* <Link
              className="position-absolute d-block d-lg-none"
              to="/Login"
              style={{ right: "1rem", top: "1rem" }}
            >
              <button className="orangeButton px-4 py-1">
                <p className="m-0 text-dark fw-bold">Log in</p>
              </button>
            </Link> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBarIndex;
