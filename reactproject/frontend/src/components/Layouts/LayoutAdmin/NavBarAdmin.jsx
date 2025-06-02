import "../style.css";
import Logo from "../../../assets/Logo.jpg";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationButton from "../LayoutAdmin/OffCanvassNotification";
import AdminAccountDropdown from "./AdminAccountDropdown";

const NavBarAdmin = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
    setIsLoading(false);
  }, [navigate]);

  if (!user) return null;

  return (
    <nav
      className="navbar navbar-expand-lg p-0"
      style={{ position: "sticky", top: "0" }}
    >
      <div className="container-fluid py-2 px-3 shadow-sm">
        <div className="logo">
          <Link to="/Admin/Home">
            <img className="logoImage" src={Logo} alt="Logo" />
          </Link>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div>
            <NotificationButton />
          </div>
          <div>
            <AdminAccountDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBarAdmin;
