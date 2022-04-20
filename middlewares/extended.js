/**
 * this has stuff like user auth, extra functions, etc.
 */
const UserModel = require("../models/user");

module.exports = async function (req, res, next) {
	req.assert = (required, sCode, msg) => {
		if (!required) {
			res
				.status(sCode)
				.json({ status: "invalid_req", msg: msg })
				.end();
			return;
		}
		return req;
	};
	try { // user authentication
		// it's in a try catch because without it req.user is undefined
		const User = new UserModel();
		const userData = await User.getUserByToken(req.cookies.utk);
		req.user = userData;
	} catch (err) {
		req.user = null;
	}
	next();
}