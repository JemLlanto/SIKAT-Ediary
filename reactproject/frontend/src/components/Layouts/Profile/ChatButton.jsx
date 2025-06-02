import Pusher from "pusher-js";
import { useState, useEffect, useRef } from "react";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Link, useNavigate } from "react-router-dom";
import FrequentlyAskQuestion from "../LayoutUser/FrequentlyAskQuestion";
import axios from "axios";
import { Dropdown } from "react-bootstrap";

const UserChatButton = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const pusherRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleClose = () => {
    setShow(false);
    setMessages([]);
    setSelectedUser(null);
  };

  const handleShow = async () => {
    setShow(true);
    if (!user?.isAdmin && admin) {
      await fetchMessages(admin.userID);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const fetchAdmin = async () => {
        try {
          const response = await axios.get("http://localhost:8081/admin");
          const data = response.data;
          setAdmin(data);
          if (!parsedUser.isAdmin) {
            await fetchMessages(data.userID);
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      };

      fetchAdmin();

      if (parsedUser.isAdmin) {
        const fetchAllUsers = async () => {
          try {
            const response = await axios.get("http://localhost:8081/users");
            const data = response.data;
            setAllUsers(data);
          } catch (error) {
            console.error("Error fetching all users:", error);
          }
        };
        fetchAllUsers();
      }
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      pusherRef.current = new Pusher("4810211a14a19b86f640", {
        cluster: "ap1",
        encrypted: true,
      });

      const channel = pusherRef.current.subscribe("chat-channel");

      channel.bind("message-event", (data) => {
        if (
          (data.recipientID === user.userID &&
            data.senderID === selectedUser) ||
          (data.senderID === user.userID && data.recipientID === selectedUser)
        ) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              username: data.username || "Unknown",
              message: data.message,
              senderID: data.senderID,
            },
          ]);
        }
      });

      return () => {
        channel.unbind_all();
        pusherRef.current.unsubscribe("chat-channel");
      };
    }
  }, [user, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (userID) => {
    if (!user) return;

    try {
      const response = await axios.get("http://localhost:8081/messages", {
        params: {
          userID: user.userID,
          withUserID: userID,
        },
      });
      setMessages(response.data);
      setSelectedUser(userID);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user || (!selectedUser && !admin)) return;

    const recipientUserID = user.isAdmin ? selectedUser : admin.userID;
    const senderUserID = user.userID;

    await fetch("http://localhost:8081/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderID: senderUserID,
        recipientID: recipientUserID,
        message: newMessage,
      }),
    });

    setNewMessage(""); // Still keep clearing the input
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
      });
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="w-100 pe-2 d-flex align-items-end justify-content-between">
            <div className="d-flex align-items-center gap-1">
              <Link
                to={`/Profile/${admin?.userID}`}
                className="linkText d-flex align-items-center gap-1 text-decoration-none "
              >
                <div className="profilePicture">
                  <img
                    src={`http://localhost:8081${admin?.profile_image}`}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h5 className="m-0">{admin?.firstName}</h5>
              </Link>
              <div
                className="p-0 m-0 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: admin?.isActive ? "var(--primary)" : "gray",
                  height: "15px",
                  width: "15px",
                  borderRadius: "50%",
                  color: "#ffff",
                }}
              ></div>

              <Dropdown>
                <Dropdown.Toggle
                  className="btn-light d-flex align-items-center pt-0 pb-2"
                  id="dropdown-basic"
                  bsPrefix="custom-toggle"
                >
                  <h5 className="m-0">...</h5>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2">
                  <Dropdown.Item className="btn btn-light rounded">
                    <Link to={`/GetHelp/${user.userID}`}>
                      <button className="secondaryButton text-decoration-underline p-0">
                        <p className="m-0">Report an Incident</p>
                      </button>
                    </Link>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {user?.isAdmin ? (
            <div>
              <ul>
                {allUsers.map((usr) => (
                  <li
                    key={usr.userID}
                    onClick={() => fetchMessages(usr.userID)}
                  >
                    {usr.username}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <div
                className="custom-scrollbar rounded mb-1 p-2"
                style={{ height: "300px", overflowY: "scroll" }}
              >
                {/* ChatBox */}
                <div className="mb-2">
                  <p className="m-0 text-secondary text-center">
                    You are now communicating with Admin. Please feel free to
                    reach out if you need assistance, and ensure that all
                    interactions remain respectful.
                  </p>
                </div>

                <div className="mt-3">
                  <h5 className="m-0 mb-1">Frequently Ask Questions</h5>
                  <FrequentlyAskQuestion></FrequentlyAskQuestion>
                </div>

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`w-100 p-0 d-flex justify-content-${
                      msg.senderID === user?.userID ? "end" : "start"
                    }`}
                  >
                    <div
                      className="rounded p-2 mt-1 text-light"
                      style={{
                        backgroundColor:
                          msg.senderID === user?.userID
                            ? "var(--secondary)"
                            : "var(--primary)",
                        maxWidth: "80%",
                        width: "fit-content",
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <p className="m-0">{msg.message}</p>
                      <p className="m-0 text-end">
                        <span
                          style={{
                            fontSize: "clamp(0.5rem, 1.5dvw, 0.6rem)",
                          }}
                        >
                          {formatDate(msg.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="position-relative">
                <FloatingLabel controlId="floatingTextarea2" label="Message">
                  <Form.Control
                    className="pe-3"
                    as="textarea"
                    placeholder="Leave a message here"
                    style={{ height: "70px" }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </FloatingLabel>
                {user?.isAdmin || admin ? (
                  <button
                    className="position-absolute py-2 d-flex align-items-center justify-content-center border-0"
                    onClick={sendMessage}
                    style={{
                      height: "40px",
                      width: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#ffff",
                      right: "10px",
                      bottom: "10px",
                      color: "var(--primary)",
                    }}
                  >
                    <i
                      className="bx bxs-send"
                      style={{ fontSize: "clamp(1.2rem, 2dvw, 1.5rem)" }}
                    ></i>
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserChatButton;
