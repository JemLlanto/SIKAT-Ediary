import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import RegisteredUsers from "../../Layouts/LayoutAdmin/AnalyticsLayout/RegisteredUser";
import FlaggedDiaries from "../../Layouts/LayoutAdmin/AnalyticsLayout/FlaggedDiaries";
import ReportedComment from "../../Layouts/LayoutAdmin/AnalyticsLayout/ReportedComment";
import ReportedUsers from "../../Layouts/LayoutAdmin/AnalyticsLayout/ReportedUsers";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const [userDeptCourse, setUserDeptCourse] = useState(null);
  const [error, setError] = useState(null);
  const [flags, setFlags] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [reportedUsers, setreportedUsers] = useState([]);
  const { activeTab } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };
  const redirect = () => {
    navigate("/Home");
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("Parsed User Data:", parsedUser);

      if (!parsedUser.isAdmin) {
        setModal({
          show: true,
          message: `Permission Denied: You are not authorized to access this page.`,
        });
        setTimeout(() => {
          redirect();
        }, 1500);
      }
    } else {
      navigate("/");
    }

    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!user || !user.userID) return; // Prevents execution if user is null

    const fetchDeptAndCourse = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/fetchUserDept&Course/user/${user.userID}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setUserDeptCourse(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDeptAndCourse();
  }, [user]); // Depend only on `user`

  const handleTabChange = (tab) => {
    navigate(`/Admin/Analytics/${tab}`);
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          throw new Error("Department ID is required");
        }

        // Fetching users
        const usersEndpoint =
          user.isAdmin === 2 && user.departmentID
            ? `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/analytics/userAnalytics?departmentID=${user.departmentID}`
            : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users`;
        const usersResponse = await axios.get(usersEndpoint);
        setUsers(usersResponse.data);

        // Fetching flagged diaries
        const flagsEndpoint =
          user.isAdmin === 2
            ? `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/analytics/flaggedAnalytics?departmentID=${user.departmentID}`
            : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/flagged`;
        const flagsResponse = await axios.get(flagsEndpoint);
        setFlags(flagsResponse.data);

        // Fetching reported comments
        const reportedCommentsEndpoint =
          user.isAdmin === 2
            ? `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/analytics/getReportedCommentsAnalytics?departmentID=${
                user.departmentID
              }`
            : `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/getReportedComments`;
        const reportedCommentsResponse = await axios.get(
          reportedCommentsEndpoint
        );
        setReportedComments(reportedCommentsResponse.data);

        // Fetching reported users
        const reportedUsersEndpoint =
          user.isAdmin === 2
            ? `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/analytics//getReportedUsersAnalytics?departmentID=${
                user.departmentID
              }`
            : `${
                import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
              }/getReportedUsers`;
        const reportedUsersResponse = await fetch(reportedUsersEndpoint);
        const reportedUsersData = await reportedUsersResponse.json();
        setreportedUsers(reportedUsersData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  return (
    <div className="pt-4 pt-lg-0">
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <div className="mt-0  px-2">
        <div
          className="container rounded shadow"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h4 className="text-light fw-bold m-0 mt-4 mt-lg-0 py-2">
            User Analytics{" "}
            {user?.isAdmin === 1 ? "" : <>({userDeptCourse?.DepartmentName})</>}
          </h4>
        </div>
        <div
          className="container rounded mt-2 p-3 shadow-sm mb-5"
          style={{
            width: "",
            height: "max-content",
            backgroundColor: "#fff",
          }}
        >
          <Tab.Container id="left-tabs-example" defaultActiveKey={activeTab}>
            <div className="mb-2">
              <Nav variant="pills" className="d-flex custom-nav ">
                <Nav.Item>
                  <Nav.Link
                    className=" d-flex align-items-center gap-2"
                    eventKey="RegisteredUser"
                    onClick={() => handleTabChange("RegisteredUser")}
                  >
                    <h5 className="m-0">
                      <i className="bx bxs-user-detail mt-1"></i>
                    </h5>
                    <p className="m-0 d-none d-md-block">Registered Users</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className=" d-flex align-items-center gap-2"
                    eventKey="FlaggedDiaries"
                    onClick={() => handleTabChange("FlaggedDiaries")}
                  >
                    <h5 className="m-0">
                      <i className="bx bx-message-alt-error mt-1"></i>
                    </h5>
                    <p className="m-0 d-none d-md-block">Flagged Diaries</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className=" d-flex align-items-center gap-2"
                    eventKey="ReportedComments"
                    onClick={() => handleTabChange("ReportedComments")}
                  >
                    <h5 className="m-0">
                      <i className="bx bx-user-pin mt-1"></i>
                    </h5>
                    <p className="m-0 d-none d-md-block">Reported Commments</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className=" d-flex align-items-center gap-2"
                    eventKey="ReportedUsers"
                    onClick={() => handleTabChange("ReportedUsers")}
                  >
                    <h5 className="m-0">
                      <i className="bx bx-user-pin mt-1"></i>
                    </h5>
                    <p className="m-0 d-none d-md-block">Reported Users</p>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
            <div>
              <Tab.Content>
                <Tab.Pane eventKey="RegisteredUser">
                  <RegisteredUsers users={users} isLoading={isLoading} />
                </Tab.Pane>
                <Tab.Pane eventKey="FlaggedDiaries">
                  <FlaggedDiaries flags={flags} isLoading={isLoading} />
                </Tab.Pane>
                <Tab.Pane eventKey="ReportedComments">
                  <ReportedComment
                    reportedComments={reportedComments}
                    isLoadings={isLoading}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="ReportedUsers">
                  <ReportedUsers
                    reportedUsers={reportedUsers}
                    isLoadings={isLoading}
                  />
                </Tab.Pane>
              </Tab.Content>
            </div>
          </Tab.Container>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
