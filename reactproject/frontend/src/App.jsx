import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexPage from "./components/pages/IndexPage";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";

// USER
import Home from "./components/pages/PagesUser/Home";
// import UserProfile from "./components/pages/PagesUser/UserProfile";
import DiaryEntries from "./components/pages/DiaryEntries";
import DiaryEntry from "./components/pages/DiaryEntry";
import Profile from "./components/pages/Profile";
import GetHelp from "./components/pages/PagesUser/GetHelp";
import Settings from "./components/pages/Settings";
import Followers from "./components/pages/Followers";
import UserCaseDetails from "./components/pages/PagesUser/CaseDetails";
import Suspended from "./components/pages/PagesUser/Suspended";
import "boxicons/css/boxicons.min.css";
import LoginRegister from "./components/pages/LoginRegister";

// ADMIN
import AdminHome from "./components/pages/PagesAdmin/AdminHome";
import ModeratorManagement from "./components/pages/PagesAdmin/ModeratorManagement";
import GenderBasedIncidents from "./components/pages/PagesAdmin/GenderBasedIncidents";
import Analytics from "./components/pages/PagesAdmin/Analytics";
import CaseDetails from "./components/pages/PagesAdmin/CaseDetails";
import Dashboard from "./components/pages/PagesAdmin/Dashboard";

import "bootstrap/dist/css/bootstrap.min.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { InactivityProvider } from "./components/InactivityContext";
import MainLayoutContext from "./components/MainLayoutContext";

function App() {
  return (
    <div className="App">
      <InactivityProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <IndexPage />
                </ProtectedRoute>
              }
            />
            <Route path="/Login" element={<LoginRegister />} />
            <Route
              path="/Login"
              element={
                <ProtectedRoute>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Register"
              element={
                <ProtectedRoute>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route element={<MainLayoutContext />}>
              {/* USER ROUTES */}
              <Route path="/Home" element={<Home />} />
              {/* <Route path="/Profile/:userID" element={<UserProfile />} /> */}
              <Route path="/Profile/:userID" element={<Profile />} />
              <Route path="/DiaryEntries/" element={<DiaryEntries />} />
              <Route path="/DiaryEntry/:entryID" element={<DiaryEntry />} />
              <Route path="/GetHelp/:userID" element={<GetHelp />} />
              <Route path="/Settings/:userID" element={<Settings />} />
              <Route path="/Followers" element={<Followers />} />
              <Route
                path="/CaseDetails/:reportID"
                element={<UserCaseDetails />}
              />

              <Route path="/suspended" element={<Suspended />} />

              {/* ADMIN ROUTES */}
              <Route path="/Admin/Home" element={<AdminHome />} />
              <Route
                path="/Admin/GenderBasedIncidents"
                element={<GenderBasedIncidents />}
              />
              <Route path="/Admin/Dashboard" element={<Dashboard />} />
              <Route
                path="/Admin/Manage-Moderators"
                element={<ModeratorManagement />}
              />
              <Route
                path="/Admin/Analytics/:activeTab"
                element={<Analytics />}
              />
              <Route
                path="/Admin/CaseDetails/:reportID"
                element={<CaseDetails />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </InactivityProvider>
    </div>
  );
}

export default App;
