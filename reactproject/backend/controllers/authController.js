const db = require("../database");
const bcrypt = require("bcryptjs");

const loginUser = (req, res) => {
  const { cvsuEmail, password } = req.body;

  if (!cvsuEmail || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const sql = `
    SELECT user_table.*, user_profiles.profile_image
    FROM user_table
    JOIN user_profiles ON user_table.userID = user_profiles.userID
    WHERE user_table.cvsuEmail = ?
  `;

  db.query(sql, [cvsuEmail], (err, data) => {
    if (err) {
      console.error("Error retrieving data: ", err);
      return res.status(500).json({ error: "Error retrieving data" });
    }

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = data[0];

    const currentDate = new Date();
    if (user.suspendUntil && new Date(user.suspendUntil) > currentDate) {
      return res.status(403).json({
        error: "Account is suspended.",
        suspendReason: user.suspendReason,
        suspendUntil: user.suspendUntil,
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.isSuspended === 1) {
      return res
        .status(403)
        .json({ error: "Account is suspended. Please try again later." });
    }

    const updateStatusSql =
      "UPDATE user_table SET isActive = ? WHERE userID = ?";
    db.query(updateStatusSql, [true, user.userID], (err, result) => {
      if (err) {
        console.error("Error updating user status: ", err);
        return res.status(500).json({ error: "Failed to update user status" });
      }

      return res.json({
        userID: user.userID,
        cvsuEmail: user.cvsuEmail,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        departmentID: user.departmentID,
        profile_image: user.profile_image,
      });
    });
  });
};

module.exports = { loginUser };
