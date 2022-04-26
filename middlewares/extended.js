/**
 * this has stuff like user auth, extra functions, etc.
 */
const User = require("../models/user");

module.exports = async function (req, res, next) {
	// log the request
	console.log(`${req.url}`)

	/**
	 * error stuff
	 */
	res.goError = (message, code = "") => {
		res
			.status(403)
			.end(`1<error><code>${code}</code><message>${message}</message><text></text></error>`);
		return res;
	};
	req.assert = (required, sCode, msg, m = 0) => {
		if (!required) {
			switch (m) {
				case 0: {
					res
						.status(sCode)
						.end(msg);
					break;
				}
				case 1: {
					res
						.status(sCode)
						.json({ status: "invalid_req", data: msg })
						.end();
					break;
				}
				case 2: {
					res
						.status(sCode)
						.goError(msg)
						.end();
					break;
				}
			}				
			return req;
		}
		return req;
	};

	/**
	 * user authentication
	 */
	try {
		// it's in a try catch because without it req.user is undefined
		const userData = await User.getUserByToken(req.cookies.utk);
		req.user = userData;
	} catch (err) {
		req.user = null;
	}
	next();
}