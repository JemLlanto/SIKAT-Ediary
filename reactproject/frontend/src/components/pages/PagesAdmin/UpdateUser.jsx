import { useState, useEffect } from "react";
import Background from "../../Layouts/Background";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpdateValidation from "../UpdateValidation";

export default function UpdateUser() {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    cvsuEmail: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        cvsuEmail: user.cvsuEmail || "",
        username: user.username || "",
        bio: user.bio || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = UpdateValidation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const userID = JSON.parse(localStorage.getItem("user")).userID;
      axios
        .put(`http://localhost:8081/EditProfile?userID=${userID}`, values)
        .then((res) => {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...values,
              userID: userID,
            })
          );
          navigate("/Home");
        })
        .catch((err) => console.log(err));
    }
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="">
      <UserNavBar />
      <div className=" container-fluid d-flex justify-content-center align-items-center mt-5">
        <div
          className="w-100 bg-white rounded shadow p-3 text-start"
          style={{ maxWidth: "700px" }}
        >
          <form onSubmit={handleSubmit} autoComplete="nope">
            <div className="row">
              <div className="col mb-3">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  onChange={handleInput}
                  className="form-control rounded"
                  value={values.firstName}
                  autoComplete="nope"
                />
                {errors.firstName && (
                  <span className="text-danger"> {errors.firstName}</span>
                )}
              </div>
              <div className="col mb-3">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  onChange={handleInput}
                  className="form-control rounded"
                  value={values.lastName}
                  autoComplete="nope"
                />
                {errors.lastName && (
                  <span className="text-danger"> {errors.lastName}</span>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your Username"
                onChange={handleInput}
                className="form-control rounded"
                value={values.username}
                autoComplete="nope"
              />
              {errors.username && (
                <span className="text-danger"> {errors.username}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="bio">Bio</label>
              <textarea
                name="bio"
                placeholder="Enter your bio"
                onChange={handleInput}
                className="form-control rounded"
                value={values.bio}
                autoComplete="nope"
              />
              {errors.bio && <span className="text-danger"> {errors.bio}</span>}
            </div>
            <div className="mb-3">
              <label htmlFor="password">
                Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter new Password"
                onChange={handleInput}
                className="form-control rounded"
                value={values.password}
                autoComplete="nope"
              />
              {errors.password && (
                <span className="text-danger"> {errors.password}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new Password"
                onChange={handleInput}
                className="form-control rounded"
                value={values.confirmPassword}
                autoComplete="nope"
              />
              {errors.confirmPassword && (
                <span className="text-danger"> {errors.confirmPassword}</span>
              )}
            </div>
            <button type="submit" className="orangeButton w-100">
              Update
            </button>
          </form>
        </div>
      </div>
      <Background />
    </div>
  );
}
