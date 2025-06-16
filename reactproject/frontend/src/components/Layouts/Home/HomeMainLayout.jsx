import { useState, useEffect, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import RightSide from "../../pages/PagesUser/HomeLayout/RightSide";
import AdminRightSide from "../../pages/PagesAdmin/HomeLayout/RightSide";
import CenterLayout from "./CenterLayout";
import LeftSideLayout from "./LeftSideLayout";
import { InactivityContext } from "../../../components/InactivityContext";

export default function HomeMainLayout({}) {
  const { user } = useOutletContext();
  const [loading, setloading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal state for inactivity alert
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const { isInactive } = useContext(InactivityContext);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setloading(false);
    } else {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    if (isInactive) {
      handleReload();
    }
  }, [isInactive]);

  const handleReload = () => {
    window.location.reload(); // Reload the page after inactivity
  };

  return (
    <>
      <div className="overflow-x-hidden">
        <div className="row">
          {/* Left Side Component */}
          <div
            className="position-fixed col-md d-none d-lg-block ps-2 ps-md-4"
            style={{
              top: "5.5rem",
              height: "calc(100dvh - 5.5rem)",
              left: "0",
              width: "25%",
            }}
          >
            <LeftSideLayout load={load} user={user} />
          </div>

          {/* Center Layout */}
          <div
            className="col-lg-6 mx-auto"
            style={{ marginLeft: "20%", marginRight: "20%" }}
          >
            <div className="row">
              <div className="col-4 d-block d-none d-md-block d-lg-none">
                <div
                  className="position-fixed ps-1 ms-3 mt-2 mt-lg-0"
                  style={{
                    top: "7.8rem",
                    height: "calc(100dvh - 5.5rem)",
                    left: "0",
                    width: "33%",
                  }}
                >
                  <LeftSideLayout load={load} user={user} />
                </div>
              </div>
              <div className="col">
                <CenterLayout setLoad={setLoad} user={user} />
              </div>
            </div>
          </div>

          {/* Right Side Component */}
          <div
            className="position-fixed col-md d-none d-lg-block  pe-2 pe-md-4"
            style={{
              top: "5.5rem",
              height: "calc(100dvh - 5.5rem)",
              right: "0",
              width: "25%",
            }}
          >
            {user?.isAdmin ? (
              <AdminRightSide load={load} user={user} />
            ) : (
              <RightSide load={load} user={user} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
