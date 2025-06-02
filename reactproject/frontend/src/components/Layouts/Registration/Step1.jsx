import React from "react";

const Step1 = ({ values, handleInput, courses }) => {
  return (
    <div
      className={`form-section active`}
      style={{ transition: "all 0.5s ease-in-out" }}
    >
      <h5>Personal Details</h5>
      <div className="d-flex flex-column gap-1 gap-md-2 mb-2">
        <div className="row gap-1 gap-md-2 px-3">
          <div className="col-md p-0">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              onChange={handleInput}
              className="form-control rounded"
              value={values.firstName}
              required
            />
          </div>
          <div className="col-md-5 p-0">
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              onChange={handleInput}
              className="form-control rounded"
              value={values.lastName}
              required
            />
          </div>
        </div>

        <div className="row gap-1 gap-md-2 px-3">
          <div className="col-md p-0">
            <input
              type="text"
              name="alias"
              placeholder="Alias (for anonymity purposes)"
              onChange={handleInput}
              className="form-control rounded"
              value={values.alias}
              required
            />
          </div>
          <div class="col-md-4 p-0">
            <label class="visually-hidden" for="sex">
              Sex
            </label>
            <select
              class="form-select"
              id="sex"
              className="form-select"
              name="sex"
              onChange={handleInput}
              value={values.sex}
              required
            >
              <option selected>Sex...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="row gap-1 gap-md-2 px-3">
          <div className="col-md p-0">
            <label className="visually-hidden" htmlFor="course">
              Course
            </label>
            <select
              class="form-select"
              id="course"
              name="course"
              onChange={handleInput}
              value={values.course}
              required
            >
              <option value="">Course...</option>
              {courses.map((course) => (
                <option key={course.courseID} value={course.courseName}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3 p-0">
            <label className="visually-hidden" htmlFor="year">
              Year
            </label>
            <select
              class="form-select"
              id="year"
              name="year"
              onChange={handleInput}
              value={values.year}
              required
            >
              <option value="">Year...</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        </div>

        <div className="row gap-1 gap-md-2 px-3">
          <div className="col-md p-0">
            <input
              type="email"
              name="cvsuEmail"
              placeholder="CvSU Email (ex. johndoe@cvsu.edu.ph)"
              onChange={handleInput}
              className="form-control rounded"
              value={values.cvsuEmail}
              required
              pattern="^[a-zA-Z0-9._%+-]+@cvsu\.edu\.ph$"
              title="Please enter a valid CvSU email (e.g., johndoe@cvsu.edu.ph)"
            />
          </div>
          <div className="col-md-4 p-0">
            <input
              type="number"
              name="studentNumber"
              placeholder="Student Number (ex. 202100000)"
              onChange={handleInput}
              className="form-control rounded"
              value={values.studentNumber}
              min="100000000"
              max="999999999"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
