/**
 * this has stuff like user auth, extra functions, etc.
 */
const User = require("../models/user");

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
	res.goError = (message, code = "") => {
		res
			.status(403)
			.end(`1<error><code>${code}</code><message>${message}</message><text></text></error>`);
		return res;
	};
	try { // user authentication
		// it's in a try catch because without it req.user is undefined
		const userData = await User.getUserByToken(req.cookies.utk);
		req.user = userData;
	} catch (err) {
		req.user = null;
	}
	next();
}