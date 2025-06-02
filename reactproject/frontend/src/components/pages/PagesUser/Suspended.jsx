import React from "react";

import { Link } from "react-router-dom";

const Suspended = () => {
  return (
    <div className="text-center mt-5">
      <h2>This account is suspended.</h2>
      <p>Please contact support for further assistance.</p>
      <Link to="/Home" className="btn btn-primary">
        Back to Homepage
      </Link>
    </div>
  );
};

export default Suspended;
