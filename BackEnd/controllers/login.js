const jwt = require("jsonwebtoken");
const db = require("../DB/db-config");

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: "error", error: "Please enter your email and password." });
    }

    try {
        const [rows] = await db.query(`
        SELECT u.*, r.name AS role_name 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.role_id 
        WHERE u.email = ?
        `, [email]);

        const user = rows[0];

        if (!user || user.password !== password) {
            return res.json({ status: "error", error: "Incorrect username or password." });
        }

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES,
        });
        const cookieExpiryDays = Number(process.env.COOKIE_EXPIRES) || 1;

        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.cookie("userRegistered", token, cookieOptions);

        return res.json({
            status: "success",
            success: "User has been logged in",
            role: user.role_name
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.json({ status: "error", error: "Database error during login." });
    }
};

module.exports = login;
