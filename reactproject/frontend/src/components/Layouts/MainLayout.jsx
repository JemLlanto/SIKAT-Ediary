import React, { useEffect, useState } from "react";
import NavBar from "./NavBar/NavBar"; // Import the regular user navigation bar
import Background from "./Background"; // Import the background component
import NavBarAdmin from "./LayoutAdmin/NavBarAdmin"; // Import the admin-specific navigation bar
import "boxicons/css/boxicons.min.css";
import ChatButton from "./LayoutUser/ChatButton";
import AdminChatButton from "./LayoutAdmin/ChatButton";

const MainLayout = ({ children, ActiveTab }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showMessage, setShowMessage] = useState(false);
  // State to store user data fetched from localStorage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState();

  // useEffect hook to run logic when the component first mounts
  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem("user");

    // If user data is found
    if (userData) {
      const parsedUser = JSON.parse(userData); // Parse the user data
      setUser(parsedUser); // Set the user data in the state
      setLoading(false);
    } else {
      // If no user data is found, redirect to the homepage
      window.location.href = "/";
    }
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowMessage(true); // Show the "You are online" message
      setTimeout(() => setShowMessage(false), 5000); // Hide after 5 seconds
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowMessage(true); // Show the "You are offline" message
      setTimeout(() => setShowMessage(false), 5000); // Hide after 5 seconds
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
    <div className="position-relative overflow-x-hidden" style={{ width: "" }}>
      <NavBar ActiveTab={ActiveTab} style={{ position: "sticky", top: "0" }} />
      <div>{user?.isAdmin == 1 ? <AdminChatButton /> : <ChatButton />}</div>
      <div className="mt-5 pt-5 pt-lg-3">
        {children}
        <div>
          {showMessage && isOffline && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "red",
                color: "white",
                textAlign: "center",
                padding: "",
                zIndex: 1000,
              }}
            >
              Internet connection lost.
            </div>
          )}
          {showMessage && !isOffline && (
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "green",
                color: "white",
                textAlign: "center",
                padding: "",
                zIndex: 1000,
              }}
            >
              You are now connected to internet.
            </div>
          )}
        </div>
      </div>

      {/* Include the background component at the bottom of the layout */}
      <Background />
    </div>
  );
};

export default MainLayout;
