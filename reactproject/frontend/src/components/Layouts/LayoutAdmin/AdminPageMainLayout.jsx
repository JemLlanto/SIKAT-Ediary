import React from "react";
import NavBarAdmin from "./NavBarAdmin";
import Background from "../Background";

const AdminPageMainLayout = ({ children }) => {
  return (
    <div style={{ height: "100vh" }}>
      <NavBarAdmin />
      <div>{children}</div>
      <Background />
    </div>
  );
};

export default AdminPageMainLayout;
