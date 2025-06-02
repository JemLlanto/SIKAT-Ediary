import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import MainLayout from "../Layouts/MainLayout";
import ProfileInformation from "../Layouts/SettingsLayouts/ProfileInformation";
import PasswordAndSecurity from "../Layouts/SettingsLayouts/PasswordAndSecurity";
import UserAuthentication from "../Layouts/SettingsLayouts/UserAuthentication";
import FilterAndSubjects from "../Layouts/SettingsLayouts/FilterAndSubjects";
import ReportingComments from "../Layouts/SettingsLayouts/ReportingComments";
import ReportingUsers from "../Layouts/SettingsLayouts/ReportingUsers";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FlaggingDiaries from "../Layouts/SettingsLayouts/FlaggingDiaries";
import AlarmingWords from "../Layouts/SettingsLayouts/AlarmingWords";
import FAQ from "../Layouts/SettingsLayouts/FAQ";
import IndexImage from "../Layouts/SettingsLayouts/IndexImage";

const Settings = () => {
  const { userID } = useParams();
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

  if (!user) return null;

  const navItemStyle = "shadow d-flex align-items-center gap-2";
  return (
    <MainLayout className="position-" ActiveTab="Settings">
      <div className="container-fluid container-md mt-4 pt-2 mb-5">
        <Tab.Container id="left-tabs-example" defaultActiveKey="profile">
          <Row>
            <Col lg={3}>
              <Nav
                variant="pills"
                className="flex-column gap-2 custom-nav mb-3 text-start"
              >
                <h5 className="m-0 text-start mb-2">Account Settings</h5>
                <Nav.Item>
                  <Nav.Link className={navItemStyle} eventKey="profile">
                    <h5 className="m-0 d-flex align-items-center">
                      <i class="bx bxs-user-detail"></i>
                    </h5>
                    <p className="m-0">Profile Information</p>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className="shadow d-flex align-items-center gap-2 p-0"
                    eventKey="security"
                  >
                    <UserAuthentication
                      userID={userID}
                      cvsuEmail={user?.cvsuEmail}
                    ></UserAuthentication>
                  </Nav.Link>
                </Nav.Item>
                {user.isAdmin == 1 ? (
                  <>
                    <h5 className="m-0 text-start my-2">Manage System</h5>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="filter">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-filter-alt"></i>
                        </h5>
                        <p className="m-0">Filtering and Subjects</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="flag">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-flag"></i>
                        </h5>
                        <p className="m-0">Flagging Diaries</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="repComment">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-comment-x"></i>
                        </h5>
                        <p className="m-0">Reporting Comments</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="repUser">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-user-x"></i>
                        </h5>
                        <p className="m-0">Reporting Users</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link
                        className={navItemStyle}
                        eventKey="alarmingWords"
                      >
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-error"></i>
                        </h5>
                        <p className="m-0">Alarming Words</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="FAQ">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-question-mark"></i>
                        </h5>
                        <p className="m-0">Frequently Ask Questions(FAQ)</p>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link className={navItemStyle} eventKey="IndexImage">
                        <h5 className="m-0 d-flex align-items-center">
                          <i class="bx bx-image"></i>
                        </h5>
                        <p className="m-0">Index Page Images</p>
                      </Nav.Link>
                    </Nav.Item>
                  </>
                ) : (
                  ""
                )}
              </Nav>
            </Col>
            <Col lg={9}>
              <Tab.Content>
                <Tab.Pane eventKey="profile">
                  <ProfileInformation></ProfileInformation>
                </Tab.Pane>
                <Tab.Pane eventKey="security">
                  <PasswordAndSecurity></PasswordAndSecurity>
                </Tab.Pane>
                <Tab.Pane eventKey="filter">
                  <FilterAndSubjects></FilterAndSubjects>
                </Tab.Pane>
                <Tab.Pane eventKey="flag">
                  <FlaggingDiaries></FlaggingDiaries>
                </Tab.Pane>
                <Tab.Pane eventKey="repComment">
                  <ReportingComments></ReportingComments>
                </Tab.Pane>
                <Tab.Pane eventKey="repUser">
                  <ReportingUsers></ReportingUsers>
                </Tab.Pane>
                <Tab.Pane eventKey="alarmingWords">
                  <AlarmingWords></AlarmingWords>
                </Tab.Pane>
                <Tab.Pane eventKey="FAQ">
                  <FAQ></FAQ>
                </Tab.Pane>
                <Tab.Pane eventKey="IndexImage">
                  <IndexImage></IndexImage>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    </MainLayout>
  );
};

export default Settings;
