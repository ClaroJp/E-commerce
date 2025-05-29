const jwt = require("jsonwebtoken");
const db = require("../DB/db-config");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.userRegistered;

    if (!token) {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      return res.redirect("/unauthorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [results] = await db.query(
      `SELECT u.*, r.name AS role
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ?`,
      [decoded.id]
    );

    if (!results || results.length === 0) {
      if (req.originalUrl.startsWith("/api")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      return res.redirect("/unauthorized");
    }

    req.user = results[0];
    next();
  } catch (err) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.redirect("/unauthorized");
  }
};

module.exports = authMiddleware;
