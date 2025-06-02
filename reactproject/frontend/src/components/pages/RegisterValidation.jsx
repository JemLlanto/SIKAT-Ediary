export default function RegisterValidation(values) {
  let errors = {};
  const emailPattern = /^[^\s@]+@cvsu\.edu\.ph$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/;

  if (!values.firstName) {
    errors.firstName = "First name is required";
  }

  if (!values.lastName) {
    errors.lastName = "Last name is required";
  }

  if (!values.cvsuEmail) {
    errors.cvsuEmail = "Email is required";
  } else if (!emailPattern.test(values.cvsuEmail)) {
    errors.cvsuEmail = "Email must be in the format of example@cvsu.edu.ph";
  }

  if (!values.studentNumber) {
    errors.studentNumber = "Student number is required.";
  }

  if (values.studentNumber) {
    const studentNumber = values.studentNumber.trim();
    if (studentNumber.length !== 9) {
      errors.studentNumber = "Student number must be exactly 9 digits";
    }
  }

  // if (!values.username) {
  //   errors.username = "Username is required";
  // }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (!passwordPattern.test(values.password)) {
    errors.password =
      "Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, and one digit";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
