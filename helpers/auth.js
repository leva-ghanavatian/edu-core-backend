const jwt = require("jsonwebtoken");

const signToken = user =>
	jwt.sign({ sub: String(user._id), role: user.role },
 			   process.env.JWT_SECRET,
			 { expiresIn: "30d" });

module.exports = { signToken };