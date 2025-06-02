import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Pusher from "pusher-js";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ChatIcon from "../../../assets/ChatIcon.png";
import SendIcon from "../../../assets/SendIcon.png";
import DefaultProfile from "../../../assets/anonymous.png";
import axios from "axios";

const ChatButton = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    setMessages([]);
  };

  const handleShow = () => setShow(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      alert("You need to log in to access the chat.");
      window.location.href = "/";
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8081/users");
        const updatedUsers = response.data.map((user) => ({
          ...user,
          lastMessageTime: null,
        }));
        setUsers(updatedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher("4810211a14a19b86f640", {
      cluster: "ap1",
      forceTLS: true,
    });

    const channel = pusher.subscribe(`user-${user.userID}`);
    const adminChannel = pusher.subscribe("admin-channel");

    const updateUnreadMessages = (data) => {
      setUsers((prevUsers) =>
        prevUsers.map((userItem) => {
          if (userItem.userID === data.senderID) {
            return {
              ...userItem,
              unreadMessages: (userItem.unreadMessages || 0) + 1,
              lastMessageTime: new Date().toISOString(),
            };
          }
          return userItem;
        })
      );
    };

    channel.bind("message-event", function (data) {
      if (selectedUser && data.senderID === selectedUser.userID) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { senderID: data.senderID, message: data.message },
        ]);
      } else {
        updateUnreadMessages(data);
      }
    });

    adminChannel.bind("message-event", function (data) {
      updateUnreadMessages(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      adminChannel.unbind_all();
      adminChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessagesForSelectedUser = async (withUserID) => {
    try {
      const response = await axios.get("http://localhost:8081/messages", {
        params: {
          userID: user.userID,
          withUserID: withUserID,
        },
      });

      setMessages(response.data);
      setSelectedUser(users.find((usr) => usr.userID === withUserID));

      setUsers((prevUsers) =>
        prevUsers.map((userItem) =>
          userItem.userID === withUserID
            ? {
                ...userItem,
                unreadMessages: 0,
                lastMessageTime: new Date().toISOString(),
              }
            : userItem
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || 0);
    const timeB = new Date(b.lastMessageTime || 0);
    return timeB - timeA;
  });

  const handleUserClick = (userItem) => {
    fetchMessagesForSelectedUser(userItem.userID);
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !user || !selectedUser) return;

    try {
      const response = await axios.post("http://localhost:8081/message", {
        senderID: user.userID,
        recipientID: selectedUser.userID,
        message: newMessage,
      });

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

  const handleBackClick = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  const filteredUsers = sortedUsers.filter((userItem) =>
    `${userItem.firstName} ${userItem.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
      // For entries older than 24 hours, show both the date and time
      return (
        entryDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) +
        "  " +
        entryDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  };

  return (
    <>
      <div className="ChatButton d-flex align-items-center justify-content-center">
        <button className="shadow p-2 position-relative" onClick={handleShow}>
          <img src={ChatIcon} alt="Chat Icon" />

          {users.some((user) => user.unreadMessages > 0) && (
            <div
              className="position-absolute d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "red",
                height: "20px",
                width: "20px",
                borderRadius: "50%",
                color: "#fff",
                fontSize: "0.8rem",
                transform: "translate(50%, -50%)",
                top: ".8em",
                left: "-1rem",
                // border: "2px solid var(--background)",
              }}
            >
              {users.reduce(
                (total, user) => total + (user.unreadMessages || 0),
                0
              )}
            </div>
          )}
          <p>
            <span className="tooltiptext" style={{ zIndex: "-2" }}>
              Messages
            </span>
          </p>
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
            {!selectedUser ? (
              <div
                className="UserList"
                style={{ height: "clamp(400px, 30vh, 500px)" }}
              >
                <div className="d-flex justify-content-between px-3 py-2 mb-2 border-bottom">
                  <h5 className="m-0 mt-2">Users</h5>
                  <InputGroup className="m-0 w-50">
                    <InputGroup.Text id="basic-addon1">
                      <i class="bx bx-search-alt-2"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className=""
                    />
                  </InputGroup>
                </div>
                <div style={{ height: "85%" }}>
                  <div
                    className="mb-4 pe-2 d-flex flex-column gap-2 overflow-y-scroll custom-scrollbar"
                    style={{ height: "100%" }}
                  >
                    {filteredUsers.map((userItem, index) => (
                      <div
                        key={index}
                        className="grayHover d-flex align-items-center justify-content-between gap-2 bg-light p-2 pe-3 rounded"
                        onClick={() => handleUserClick(userItem)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className=" d-flex align-items-center gap-2">
                          <div className="profilePicture">
                            <img
                              src={
                                userItem.profile_image
                                  ? `http://localhost:8081${userItem.profile_image}`
                                  : DefaultProfile
                              }
                              alt="Profile"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <p className="m-0">
                            {userItem.firstName} {userItem.lastName}
                          </p>
                        </div>
                        {userItem.unreadMessages > 0 ? (
                          <div
                            className="p-0 m-0 d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: "var(--primary)",
                              height: "15px",
                              width: "15px",
                              borderRadius: "50%",
                              color: "#ffff",
                              fontSize: "0.8rem",
                            }}
                          >
                            {userItem.unreadMessages}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="ChatRoom p-2 pt-0"
                style={{ minHeight: "clamp(400px, 30vh, 500px)" }}
              >
                <div className="py-0 d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center"
                    onClick={handleBackClick}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bx bx-arrow-back"></i>
                  </div>

                  <Link
                    to={`/Profile/${selectedUser.userID}`}
                    className="linkText d-flex align-items-center gap-1 text-decoration-none "
                  >
                    <div className="profilePicture">
                      <img
                        src={`http://localhost:8081${selectedUser.profile_image}`}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h5 className="m-0">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h5>
                  </Link>
                </div>
                <div>
                  <div
                    className="border rounded mb-1 p-2 custom-scrollbar "
                    style={{ height: "300px", overflowY: "scroll" }}
                  >
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`w-100 p-0 d-flex justify-content-${
                          msg.senderID === user?.userID ? "end" : "start"
                        }`}
                      >
                        <div
                          className="rounded p-2 mt-1 text-light text-start"
                          style={{
                            backgroundColor:
                              msg.senderID === user?.userID
                                ? "var(--secondary)"
                                : "var(--primary)",
                            maxWidth: "80%",
                            minWidth: "20%",
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
                              {msg.created_at ? formatDate(msg.created_at) : ""}
                            </span>{" "}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Scroll reference */}
                  </div>
                  <div className="position-relative">
                    <FloatingLabel
                      controlId="floatingTextarea2"
                      label="Message"
                    >
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
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatButton;
