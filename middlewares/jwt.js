const jwt = require("jsonwebtoken")
	, User = require("../models/user");

module.exports = function (req, res, next) {
	const token = req.cookies.utk;
	if (token == null) {
		next();
		return false;
	}

	jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
		if (err) {
			next();
			return false;
		};
		User
			.get(user.id)
			.then()
			.catch(err => {
				next();
				return false;
			})
		req.user = user;
		req.user.token = token;
		next();
	})
}
