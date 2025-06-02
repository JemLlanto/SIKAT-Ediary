import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// import LeftSide from "../../pages/PagesUser/HomeLayout/LeftSide";
// import Center from "../../pages/PagesUser/HomeLayout/Center";
import RightSide from "../../pages/PagesUser/HomeLayout/RightSide";

// import AdminLeftSide from "../../pages/PagesAdmin/HomeLayout/LeftSide";
// import AdminCenter from "../../pages/PagesAdmin/HomeLayout/Center";
import AdminRightSide from "../../pages/PagesAdmin/HomeLayout/RightSide";

import MainLayout from "../MainLayout";
// import ChatButton from "../LayoutUser/ChatButton";
// import AdminChatButton from "../LayoutAdmin/ChatButton";
import CenterLayout from "./CenterLayout";
import LeftSideLayout from "./LeftSideLayout";

import { InactivityContext } from "../../../components/InactivityContext";
import axios from "axios";

export default function HomeMainLayout({}) {
  const [user, setUser] = useState(null);
  const [loading, setloading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal state for inactivity alert
  const navigate = useNavigate();

  const { isInactive } = useContext(InactivityContext);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/");
    }
    setloading(false);
  }, [navigate]);

  useEffect(() => {
    if (isInactive) {
      setShowModal(true); // Show modal when inactivity detected
    }
  }, [isInactive]);

  const handleReload = () => {
    window.location.reload(); // Reload the page after inactivity
  };

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
  return (
    <MainLayout ActiveTab="Home">
      <div className="overflow-x-hidden">
        <div className="row mt-3 px-3">
          {/* Left Side Component */}
          <div
            className="position-fixed col-md d-none d-lg-block"
            style={{
              top: "5.5rem",
              height: "calc(100dvh - 5.5rem)",
              left: "0",
              width: "25%",
            }}
          >
            <LeftSideLayout />
          </div>

          {/* Center Layout */}
          <div
            className="col-lg-6 mx-auto p-0 px-lg-2 mt-2 mt-lg-0"
            style={{ marginLeft: "20%", marginRight: "20%" }}
          >
            <div className="row">
              <div className="col-4 d-block d-none d-md-block d-lg-none">
                <div
                  className="position-fixed ps-1 ms-3"
                  style={{
                    top: "7.8rem",
                    height: "calc(100dvh - 5.5rem)",
                    left: "0",
                    width: "33%",
                  }}
                >
                  <LeftSideLayout />
                </div>
              </div>
              <div className="col mx-0 mx-md-4">
                <CenterLayout />
              </div>
            </div>
          </div>

          {/* Right Side Component */}
          <div
            className="position-fixed col-md d-none d-lg-block"
            style={{
              top: "5.5rem",
              height: "calc(100dvh - 5.5rem)",
              right: "0",
              width: "25%",
            }}
          >
            {user?.isAdmin ? <AdminRightSide /> : <RightSide />}
          </div>
        </div>
      </div>

      {/* Modal for inactivity alert */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Inactivity Alert</h5>
              </div>
              <div className="modal-body">
                <p>You have been inactive. The page will be reloaded.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="w-100 primaryButton"
                  onClick={handleReload}
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
