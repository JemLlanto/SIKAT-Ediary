import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultProfile from "../../../../../src/assets/anonymous.png";

const RightSide = () => {
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [reportedUsers, setReportedUsers] = useState([]);
    const [flaggedUsers, setFlaggedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchFlagged();
            fetchReports();
            fetchReportedUsers();
        } else {
            navigate("/");
        }
    }, [navigate]);

    const fetchReports = async () => {
        try {
            const response = await axios.get("http://localhost:8081/reports");
            setReports(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchReportedUsers = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8081/getReportedUsers"
            );

            if (response.data.length > 0) {
                const reportCount = {};

                response.data.forEach((report) => {
                    const key = `${report.userID}-${report.reason}`;
                    if (reportCount[key]) {
                        reportCount[key].count += 1;
                    } else {
                        reportCount[key] = { ...report, count: 1 };
                    }
                });

                setReportedUsers(Object.values(reportCount));
            }
        } catch (error) {
            console.error("Error fetching reported users:", error);
        }
    };

    const fetchFlagged = async () => {
        try {
            const response = await axios.get("http://localhost:8081/flagged");
            if (response.data.length > 0) {
                const flagCount = {};

                response.data.forEach((flag) => {
                    const key = `${flag.userID}-${flag.reason}`;
                    if (flagCount[key]) {
                        flagCount[key].count += 1;
                    } else {
                        flagCount[key] = { ...flag, count: 1 };
                    }
                });

                setFlaggedUsers(Object.values(flagCount));
            } else {
                console.warn("No flagged diaries found in response data.");
            }
        } catch (error) {
            console.error("Error fetching flagged users:", error);
        }
    };

    if (!user) return null;

    const ReportedUsers = "ReportedUsers";
    const FlaggedDiaries = "FlaggedDiaries";

    return (
        <div className="p-2">
            <button
                className="w-100 btn btn-danger "
                disabled={user.isAdmin !== 1}
            >
                <Link
                    className="w-100 text-decoration-none text-light"
                    to="/Admin/GenderBasedIncidents"
                >
                    <p className="m-0 text-center">
                        Gender-Based Incidents Complaints:{" "}
                        {reports.length > 0 ? reports.length : 0}
                    </p>
                </Link>
            </button>
            <div className="rounded mt-2 ">
                <div className="py-2 d-flex justify-content-between align-items-center gap-2 border-bottom border-secondary-subtle text-secondary">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <i class="bx bx-user-voice bx-sm"></i>
                        <h5 className=" m-0">Reported User/s</h5>
                    </div>
                    <Link
                        className="linkText rounded"
                        to={`/Admin/Analytics/${ReportedUsers}`}
                    >
                        <p className="m-0">View All</p>
                    </Link>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="w-100 custom-scrollbar mt-2 pe-1"
                        style={{ height: "25vh", overflowY: "scroll" }}
                    >
                        {/* WHEN CLICKED IT SHOULD DISPLAY THE COMMENT OF THE REPORTED USER */}
                        {reportedUsers.length > 0 ? (
                            reportedUsers
                                .filter(
                                    (reportedUser) =>
                                        user.isAdmin !== 2 ||
                                        reportedUser.departmentID ===
                                            user.departmentID
                                )
                                .map((reportedUser, index) => (
                                    <>
                                        {reportedUser.isAddress ? null : (
                                            <Link
                                                key={`${reportedUser.userID}-${reportedUser.reason}-${index}`}
                                                to={`/Profile/${reportedUser.userID}`}
                                                className="text-decoration-none"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="linkText d-flex align-items-center gap-2 rounded">
                                                    <div className="profilePicture">
                                                        <img
                                                            src={
                                                                reportedUser.profile_image
                                                                    ? `http://localhost:8081${reportedUser.profile_image}`
                                                                    : DefaultProfile
                                                            }
                                                            alt="Profile"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-75 d-flex flex-column align-items-start text-start">
                                                        <p className="text-secondary m-0">
                                                            {
                                                                reportedUser.firstName
                                                            }{" "}
                                                        </p>
                                                        <h6 className="text-danger m-0">
                                                            Violation Count:{" "}
                                                            {
                                                                reportedUser.reportCount
                                                            }
                                                        </h6>
                                                        {/* <p className="text-danger m-0">
                        Reported {reportedUser.count} times
                      </p> */}
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                ))
                        ) : (
                            <p className="text-secondary">
                                No reported users found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="">
                <div className="py-2 d-flex justify-content-between align-items-center gap-2 border-bottom border-secondary-subtle text-secondary">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <i class="bx bx-comment-error bx-sm"></i>
                        <h5 className="m-0">Flagged Diaries</h5>
                    </div>
                    <Link
                        className="linkText rounded"
                        to={`/Admin/Analytics/${FlaggedDiaries}`}
                    >
                        <p className="m-0">View All</p>
                    </Link>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="w-100 custom-scrollbar mt-2 pe-1"
                        style={{ height: "40vh", overflowY: "scroll" }}
                    >
                        {flaggedUsers.length > 0 ? (
                            flaggedUsers
                                .filter(
                                    (flaggedUser) =>
                                        user.isAdmin !== 2 ||
                                        flaggedUser.departmentID ===
                                            user.departmentID
                                )
                                .map((flaggedUser, index) => (
                                    <>
                                        {flaggedUser.isAddress ? null : (
                                            <Link
                                                key={`${flaggedUser.userID}-${flaggedUser.reason}-${index}`}
                                                to={`/DiaryEntry/${flaggedUser.entryID}`}
                                                className="text-decoration-none rounded"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="linkText d-flex align-items-center gap-2 rounded">
                                                    <div className="profilePicture">
                                                        <img
                                                            src={
                                                                flaggedUser.profile_image
                                                                    ? `http://localhost:8081${flaggedUser.profile_image}`
                                                                    : DefaultProfile
                                                            }
                                                            alt="Profile"
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-75 d-flex flex-column align-items-start text-start">
                                                        <h5 className="text-secondary m-0">
                                                            {flaggedUser.title}{" "}
                                                        </h5>
                                                        <h6 className="text-danger m-0">
                                                            Flag Count:{" "}
                                                            {
                                                                flaggedUser.flagCount
                                                            }
                                                        </h6>
                                                        {/* <p className="text-danger m-0">Flagged times</p> */}
                                                    </div>
                                                </div>
                                            </Link>
                                        )}
                                    </>
                                ))
                        ) : (
                            <p className="text-secondary">
                                No flagged diaries found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RightSide;
