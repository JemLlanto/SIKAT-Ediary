import { React, useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MessageModal from "../../Layouts/DiaryEntry/messageModal";
import ManagingModeratorButton from "../../Layouts/LayoutAdmin/ManagingModerators/ManagingModeratorButton";

const ModeratorManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [department, setDepartment] = useState([]);
  const [courses, setCourses] = useState([]);
  const [moderators, setModerators] = useState([]);
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: "" });
  const closeModal = () => {
    setModal({ show: false, message: "" });
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);

      if (parsedUser.isAdmin !== 1) {
        setModal({
          show: true,
          message: `Permission Denied: You are not authorized to access this page.`,
        });
        setTimeout(() => {
          parsedUser.isAdmin === 2
            ? navigate("/Admin/Home")
            : navigate("/Home");
        }, 1500);
      }
    } else {
      navigate("/");
    }

    // setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    console.log("Fetching departments...");
    axios
      .get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/fetchDepartments`)
      .then((response) => {
        setDepartment(response.data);
        console.log("Departments fetched...");
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, []);

  useEffect(() => {
    if (department) {
      console.log("Fetching courses...");

      axios
        .get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getCourses`)
        .then((response) => {
          setCourses(response.data);
          console.log("Courses fetched...");
        })
        .catch((error) => {
          console.error("Error fetching courses:", error);
        });
    }
  }, [department]);

  const fetchModerator = () => {
    console.log("Fetching administrators...");

    axios
      .get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/fetchDepartmentModerators`
      )
      .then((response) => {
        setModerators(response.data);
        console.log("Moderators fetched...");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching moderators:", error);
      });
  };

  useEffect(() => {
    if (courses) {
      fetchModerator();
    }
  }, [courses]);

  return (
    <>
      <MessageModal
        showModal={modal}
        closeModal={closeModal}
        title={"Notice"}
        message={modal.message}
      ></MessageModal>
      <div className="mt-0 mt-lg-2 pt-3 pt-lg-0 px-2">
        <div
          className="container rounded shadow"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <h4 className="text-light fw-bold m-0 mt-4 mt-lg-0 py-2">
            Manage Moderators
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
          <div className="overflow-auto">
            <Table striped bordered hover size="lg" className="m-0 rounded">
              <thead>
                <tr className="fw-bold">
                  <th className="text-center align-middle py-2">
                    <h4 className="m-0 text-center align-middle">Department</h4>
                  </th>
                  <th className="text-center align-middle">
                    <h4 className="m-0 text-center align-middle">Courses</h4>
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "20%" }}
                  >
                    <h4 className="m-0 text-center align-middle">Moderators</h4>
                  </th>
                  <th
                    className="text-center align-middle"
                    style={{ width: "15%" }}
                  >
                    <h4 className="m-0 text-center align-middle">Actions</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <td
                      colSpan={4}
                      scope="row"
                      className="text-center align-middle"
                    >
                      <h5 className="m-0 text-secondary ">
                        <span className="d-flex align-items-center justify-content-center gap-1">
                          <i className="bx bx-loader bx-spin"></i>Loading admin
                          data.
                        </span>
                      </h5>
                    </td>
                  </>
                ) : (
                  <>
                    {department.map((dept) => (
                      <tr key={dept.departmentID}>
                        <td className="text-center align-middle py-2">
                          <p className="m-0 text-center align-middle">
                            {dept.DepartmentName}
                          </p>
                        </td>
                        <td className="text-center align-middle py-2">
                          {courses.filter(
                            (course) =>
                              dept.departmentID === course.departmentID
                          ).length > 0 ? (
                            courses
                              .filter(
                                (course) =>
                                  dept.departmentID === course.departmentID
                              )
                              .map((course) => (
                                <p
                                  key={course.courseID}
                                  className="m-0 text-center align-middle"
                                >
                                  {course.courseName}
                                </p>
                              ))
                          ) : (
                            <>
                              <p className="m-0 text-secondary">
                                No courses available
                              </p>
                            </>
                          )}
                        </td>
                        <td className="text-center align-middle py-2">
                          {moderators.filter(
                            (mod) => dept.departmentID === mod.departmentID
                          ).length > 0 ? (
                            moderators
                              .filter(
                                (mod) => dept.departmentID === mod.departmentID
                              )
                              .map((mod) => (
                                <p
                                  key={mod.userID}
                                  className="m-0 text-center align-middle"
                                >
                                  {mod.firstName} {mod.lastName}
                                </p>
                              ))
                          ) : (
                            <>
                              <p className="m-0 text-secondary">
                                No moderator.
                              </p>
                            </>
                          )}
                        </td>
                        <td className="text-center align-middle py-2">
                          <ManagingModeratorButton
                            fetchModerator={fetchModerator}
                            departmentID={dept.departmentID}
                            departmentName={dept.DepartmentName}
                            moderators={moderators}
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModeratorManagement;
