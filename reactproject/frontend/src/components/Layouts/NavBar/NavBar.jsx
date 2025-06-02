import "../style.css";
import Logo from "../../../assets/Logo.jpg";
import TextLogo from "../../../assets/TextLogo.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationButton from "./NotificationButton";
import AccountDropdown from "./AccountDropdown";

const NavBar = ({ ActiveTab }) => {
  const [user, setUser] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async (userID) => {
    try {
      const response = await fetch(
        `http://localhost:8081/fetchUser/user/${userID}`
      );

      if (!response.ok) {
        throw new Error("User not found");
      }

      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      fetchUserData(parsedUser.userID);
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (loading) {
    return (
      <nav
        className="navbar navbar-expand-lg p-0 pt-2 pt-lg-0"
        style={{
          position: "fixed",
          top: "0",
          minHeight: "4.2rem",
          width: "100%",
        }}
      ></nav>
    );
  }

  if (!user) return null;

  const RegisteredUser = "RegisteredUser";

  return (
    <nav
      className="navbar navbar-expand-lg p-0 pt-2 pt-lg-0"
      style={{
        position: "fixed",
        top: "0",
        minHeight: "4rem",
        width: "100%",
        zIndex: "1000",
      }}
    >
      <div className="container-fluid py-2 px-3 ">
        <div className="d-flex align-items-center gap-2">
          <div className="logo">
            <Link to={user && user.isAdmin ? "/Admin/Home" : "/Home"}>
              <img className="logoImage" src={Logo} alt="Logo" />
            </Link>
          </div>
          <div className="TextLogo d-flex align-items-center">
            <Link to={user.isAdmin ? "/Admin/Home" : "/Home"}>
              <img src={TextLogo} alt="" style={{ height: "2.5rem" }} />
            </Link>
          </div>
        </div>
        <div className="w-100 d-flex justify-content-center text-light gap-1 pt-2 pt-md-0 ">
          <Link
            className={`navIcons text-light ${
              ActiveTab === "Home" ? "active" : ""
            }`}
            to={user && user.isAdmin ? "/Admin/Home" : "/Home"}
            onClick={(e) => {
              // Check if the current page matches the link's destination
              const targetPath = user && user.isAdmin ? "/Admin/Home" : "/Home";
              if (window.location.pathname === targetPath) {
                e.preventDefault(); // Prevent the default behavior of the link
                window.location.reload(); // Force a full page reload
              }
            }}
          >
            <i class="bx bx-home-alt"></i>
            <p className="navToolTip">Home</p>
          </Link>

          {user.isAdmin == 1 ? (
            <Link
              className={`navIcons text-light ${
                ActiveTab === "Dashboard" ? "active" : ""
              }`}
              to="/Admin/Dashboard"
            >
              <i class="bx bxs-dashboard"></i>
              <p className="navToolTip">Dashboard</p>
            </Link>
          ) : (
            ""
          )}

          <Link
            className={`navIcons text-light ${
              ActiveTab === "Entries" ? "active" : ""
            }`}
            to="/DiaryEntries"
          >
            <i class="bx bx-note"></i>
            <p className="navToolTip">
              {user && user.isAdmin ? "Post" : "Diary Entries"}
            </p>
          </Link>
          {user && user.isAdmin ? (
            ""
          ) : (
            <Link
              className={`navIcons text-light ${
                ActiveTab === "Followers" ? "active" : ""
              }`}
              to="/Followers"
            >
              <i className="bx bx-group bx-sm"></i>
              <p className="navToolTip">Followers</p>
            </Link>
          )}

          {user && user.isAdmin ? (
            <Link
              className={`navIcons text-light ${
                ActiveTab === "Analytics" ? "active" : ""
              }`}
              to={`/Admin/Analytics/${RegisteredUser}`}
            >
              <i class="bx bx-chart"></i>
              <p className="navToolTip">User Analytics</p>
            </Link>
          ) : (
            ""
          )}

          {user && user.isAdmin == 1 ? (
            <Link
              className={`navIcons text-light ${
                ActiveTab === "Complaints" ? "active" : ""
              }`}
              to="/Admin/GenderBasedIncidents"
            >
              <i class="bx bxs-report"></i>
              <p className="navToolTip">Complaints</p>
            </Link>
          ) : (
            ""
          )}

          <Link
            className={`navIcons text-light ${
              ActiveTab === "Settings" ? "active" : ""
            }`}
            to={`/Settings/${user.userID}`}
          >
            <i class="bx bx-cog"></i>
            <p className="navToolTip">Settings</p>
          </Link>
        </div>
        <div className="d-flex align-items-center gap-2 navDropdown">
          <div>
            <NotificationButton userID={user.userID} />
          </div>
          <div>
            <AccountDropdown userID={user.userID} isAdmin={user.isAdmin} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
