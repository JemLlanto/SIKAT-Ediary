export default function LoginValidation(values) {
  let errors = {};
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/;

  if (!values.cvsuEmail) {
    errors.cvsuEmail = "Email should not be empty";
  }

  if (!values.password) {
    errors.password = "Password should not be empty";
  }

  return errors;
}
