export default function RegisterValidation(values) {
  let errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/;

  if (!emailPattern.test(values.cvsuEmail)) {
    errors.cvsuEmail = "Email format is invalid";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
