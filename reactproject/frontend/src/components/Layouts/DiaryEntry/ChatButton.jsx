import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Pusher from "pusher-js";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
// import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
// import ChatIcon from "../../../assets/ChatIcon.png";
// import SendIcon from "../../../assets/SendIcon.png";
import DefaultProfile from "../../../assets/anonymous.png";
import axios from "axios";

const ChatButton = ({ user, entry, userToChat }) => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [parsedUser, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(entry);
  const [users, setUsers] = useState([]);
  const [isLoadingMess, setIsLoadingMess] = useState(false);
  const messagesEndRef = useRef(null);

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    setMessages([]);
  };

  const handleShow = () => {
    console.log("Fetching messages");
    fetchMessages(entry.userID);
    setShow(true);
  };

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher("4810211a14a19b86f640", {
      cluster: "ap1",
      forceTLS: true,
    });

    const channel = pusher.subscribe(`user-${user.userID}`);

    const adminChannel = pusher.subscribe("admin-channel");

    channel.bind("message-event", function (data) {
      if (
        entry &&
        data.recipientID === entry.userID &&
        data.senderID !== user.userID // Ignore your own messages
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { senderID: data.senderID, message: data.message },
        ]);
      }
    });

    // Listen for all messages in the admin channel
    adminChannel.bind("message-event", function (data) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderID: data.senderID, message: data.message },
      ]);
    });

    // Cleanup function
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      adminChannel.unbind_all();
      adminChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [user, entry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (userID) => {
    if (!user) return;

    try {
      setIsLoadingMess(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/messages`,
        {
          params: {
            userID: user.userID,
            withUserID: userID,
          },
        }
      );
      setMessages(response.data);
      setSelectedUser(userID);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMess(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user || !entry) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/message`,
        {
          senderID: user.userID,
          recipientID: entry.userID,
          message: newMessage,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderID: user.userID,
          message: newMessage,
          created_at: new Date().toISOString(), // Add a timestamp
        },
      ]);

      setNewMessage(""); // Clear the input field
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to the latest message
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
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
      });
    }
  };
  // console.log("use: ", user);
  return (
    <>
      <div className=" d-flex align-items-center justify-content-center position-relative">
        <button
          className="InteractButton informationToolTip d-flex align-items-center justify-content-center gap-2"
          onClick={handleShow}
          disabled={
            user.isAdmin != 1 ||
            entry.isAdmin === 1 ||
            (!entry.containsAlarmingWords && !entry.isFlagged)
          }
        >
          <div className="text-secondary d-flex align-items-center justify-content-center gap-2">
            <i className="bx bx-chat my-1"></i>
            <p className="m-0 d-none d-md-block">Message</p>
            {user.isAdmin === 2 && (
              <p
                className="infToolTip rounded p-2 m-0 mt-1"
                style={{ width: "clamp(8rem, 20dvw, 15rem)" }}
              >
                Only administrators have permission to send messages to users.
              </p>
            )}
            {user.isAdmin === 1 && !entry.isFlagged && (
              <p
                className="infToolTip rounded p-2 m-0 mt-1"
                style={{ width: "clamp(8rem, 20dvw, 15rem)" }}
              >
                Diary is not flagged and doesn't have alarming words.
              </p>
            )}
          </div>
        </button>
      </div>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h4 className="m-0">Messages</h4>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2" style={{ overflow: "hidden" }}>
          <div>
            <div
              className="ChatRoom p-2 pt-0"
              style={{ minHeight: "clamp(400px, 30vh, 500px)" }}
            >
              <div className="py-0 d-flex align-items-center gap-2">
                <Link
                  to={`/Profile/${userToChat}`}
                  className="linkText d-flex align-items-center gap-1 text-decoration-none "
                >
                  <div className="profilePicture">
                    <img
                      src={entry.profile_image}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <h5 className="m-0">
                    {entry.firstName} {entry.lastName}
                  </h5>
                </Link>
              </div>
              <div>
                <div
                  className="border rounded mb-1 p-2 custom-scrollbar"
                  style={{ height: "300px", overflowY: "scroll" }}
                >
                  {isLoadingMess ? (
                    <>
                      <div
                        className={`w-100 p-0 d-flex justify-content-center
                        }`}
                      >
                        <div
                          className="rounded p-2 mt-1 text-secondary"
                          style={{
                            maxWidth: "80%",
                            width: "fit-content",
                            wordWrap: "break-word",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <p className="m-0">Loading messages.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <>
                          {msg.created_at ? (
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
                                    {msg.created_at
                                      ? formatDate(msg.created_at)
                                      : ""}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} /> {/* Scroll reference */}
                </div>
                <div className="position-relative">
                  <FloatingLabel controlId="floatingTextarea2" label="Message">
                    <Form.Control
                      as="textarea"
                      placeholder="Message"
                      style={{ height: "70px" }}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </FloatingLabel>
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
                      className="bx bxs-send "
                      style={{ fontSize: "clamp(1.2rem, 2dvw, 1.5rem)" }}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatButton;
