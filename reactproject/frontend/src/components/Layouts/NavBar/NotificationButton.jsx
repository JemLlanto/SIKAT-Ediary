import { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import Toast from "react-bootstrap/Toast";
import { Link } from "react-router-dom";
import axios from "axios";
import Pusher from "pusher-js";
import DefaultProfile from "../../../../src/assets/userDefaultProfile.png";
import { Dropdown } from "react-bootstrap";

function NotificationButton() {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const pusher = new Pusher("4810211a14a19b86f640", {
        cluster: "ap1",
      });

      const channel = pusher.subscribe(`notifications-${parsedUser.userID}`);

      channel.bind("new-notification", (data) => {
        console.log("New notification received:", data);
        setNotifications((prevNotifications) => {
          const updatedNotifications = [...prevNotifications, data];
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications)
          );
          setUnreadCount((prevCount) => prevCount + 1);
          return updatedNotifications;
        });

        // Add toasts for new notifications
        const newToast = { ...data, id: Date.now(), visible: true };

        setToasts((prevToasts) => [...prevToasts, newToast]);

        // Set a timeout to hide the toast after 5 seconds
        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.map((toast) =>
              toast.id === newToast.id ? { ...toast, visible: false } : toast
            )
          );
        }, 5000);
      });

      return () => {
        pusher.unsubscribe(`notifications-${parsedUser.userID}`);
      };
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `http://localhost:8081/getnotifications/${user.userID}`
        );

        const fetchedNotifications = response.data.map((notification) => ({
          ...notification,
          actorProfileImage: notification.actorProfileImage
            ? `http://localhost:8081${notification.actorProfileImage}`
            : DefaultProfile,
        }));

        setNotifications(fetchedNotifications);

        const unread = fetchedNotifications.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unread);

        localStorage.setItem(
          "notifications",
          JSON.stringify(fetchedNotifications)
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (show) {
      fetchNotifications();
    }
  }, [show, user]);

  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);

      const unread = parsedNotifications.filter(
        (notification) => !notification.read
      ).length;
      setUnreadCount(unread);
    }
  }, []);

  useEffect(() => {
    if (show && notifications.length > 0) {
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);

      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      axios
        .put("http://localhost:8081/notifications/mark-as-read", {
          userID: user.userID,
          notificationIDs: notifications.map((n) => n.notificationID),
        })
        .catch((error) =>
          console.error("Error marking notifications as read:", error)
        );
    }
  }, [show]);

  const markAsReadAndNavigate = (notificationID) => {
    if (!user) return;

    axios
      .put("http://localhost:8081/notifications/mark-as-read", {
        userID: user.userID,
        notificationID,
      })
      .catch((error) =>
        console.error("Error marking notification as read:", error)
      );

    if (notificationID) {
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    setNotifications(updatedNotifications);
    setUnreadCount(0);

    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    try {
      await axios.put("http://localhost:8081/notifications/mark-all-as-read", {
        userID: user.userID,
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatDate = (dateString) => {
    const entryDate = new Date(dateString);
    const now = new Date();
    const timeDiff = now - entryDate;

    if (timeDiff < 24 * 60 * 60 * 1000) {
      return entryDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return entryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <>
      {/* Toasts for new notifications */}
      <div
        style={{ position: "fixed", bottom: "1rem", left: "1rem" }}
        className="toast-container"
      >
        {toasts.map((toast) => (
          <Link
            className="text-decoration-none"
            to={
              toast.type === "follow"
                ? `/profile/${toast.actorID}`
                : `/DiaryEntry/${toast.entryID || ""}`
            }
            onClick={() => markAsReadAndNavigate(toast.notificationID)}
          >
            <Toast
              key={toast.id}
              onClose={() =>
                setToasts((prevToasts) =>
                  prevToasts.filter((t) => t.id !== toast.id)
                )
              }
              show={toast.visible}
              delay={5000}
              autohide
            >
              <Toast.Header>
                <div className="w-100 d-flex justify-content-between align-items-end">
                  <p className="m-0 fw-bold">New Notification</p>
                  <p className="m-0">
                    <span style={{ fontSize: "clamp(0.6rem, 1.5dvw, 0.7rem)" }}>
                      {formatDate(toast.timestamp)}
                    </span>
                  </p>
                </div>
              </Toast.Header>
              <Toast.Body>
                <p className="m-0 text-secondary text-start">{toast.message}</p>
              </Toast.Body>
            </Toast>
          </Link>
        ))}
      </div>
      <button
        className="logo overflow-visible position-relative d-flex align-items-center justify-content-center"
        onClick={handleShow}
      >
        <i className="bx bxs-bell bx-sm"></i>
        {unreadCount > 0 && (
          <div
            className="position-absolute p-0 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "red",
              top: "0",
              left: "clamp(-7px, 2.5dvw, -10px)",
              height: "clamp(.9rem, 1.7dvw, 1.3rem)",
              width: "clamp(.9rem, 1.7dvw, 1.3rem)",
              borderRadius: "50%",
              color: "#ffff",
              border: "2px solid var(--primary)",
            }}
          >
            <div className="position-relative">
              <h6
                className="position-absolute m-0 p-0 fw-lighter d-none d-lg-block"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(.5rem, 1dvw, .7rem)",
                  }}
                >
                  {unreadCount < 10 ? unreadCount : "9+"}
                </span>
              </h6>
            </div>
          </div>
        )}
      </button>

      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="d-flex align-items-center gap-1">
              <h4 className="m-0 ">Notifications</h4>
              {unreadCount > 0 && (
                <div
                  className="p-0 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "red",
                    top: "0",
                    left: "clamp(-7px, 2.5dvw, -10px)",
                    height: "clamp(1.3rem, 2.5dvw, 1.5rem)",
                    width: "clamp(1.3rem, 2.5dvw, 1.5rem)",
                    borderRadius: "50%",
                    color: "#ffff",
                  }}
                >
                  <h6 className="m-0 p-0 fw-bolder">
                    <span style={{ fontSize: "clamp(.8rem, 1dvw, .9rem)" }}>
                      {unreadCount}
                    </span>
                  </h6>
                </div>
              )}

              <Dropdown>
                <Dropdown.Toggle
                  className="p-0 px-1 py-1 grayHover d-flex"
                  variant="transparent"
                  bsPrefix
                >
                  <i
                    class="bx bx-dots-horizontal-rounded"
                    style={{ fontSize: "clamp(1.2rem, 1.3dvw, 1.5rem)" }}
                  ></i>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item className="btn btn-light p-0 px-2">
                    <button
                      className="w-100 btn btn-light"
                      onClick={markAllAsRead}
                    >
                      <p className="m-0">Mark all as read</p>
                    </button>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {notifications.length === 0 ? (
            <p>No notifications available.</p>
          ) : (
            notifications.map((notification) => (
              <Link
                key={notification.timestamp}
                className="text-decoration-none text-dark"
                to={
                  notification.type === "follow"
                    ? `/profile/${notification.actorID}`
                    : `/DiaryEntry/${notification.entryID || ""}`
                }
                onClick={() =>
                  markAsReadAndNavigate(notification.notificationID)
                }
              >
                <div
                  className="row grayHover d-flex align-items-center gap-2 p-2 rounded my-1"
                  style={{
                    backgroundColor: notification.read ? "white" : "",
                  }}
                >
                  <div className="col-1 p-0">
                    <div className="profilePicture">
                      <img
                        src={notification.actorProfileImage || DefaultProfile}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div className="col ms-1">
                    <p className="m-0 ">
                      {notification.actorUsername} {notification.message}
                    </p>
                    <h6 className="text-secondary" style={{ fontSize: "13px" }}>
                      {formatDate(notification.timestamp)}
                    </h6>
                  </div>
                </div>
              </Link>
            ))
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default NotificationButton;
