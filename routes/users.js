// modules
const express = require("express");
const router = express.Router();
// stuff
const User = require("../models/user");

/**
 * frontend
 */
router.get("/user/:uId", async (req, res) => {
	const user = await User.getUserById(req.params.uId);

	if (!user) {
		res.status(404).send("User not found");
		return;
	}
	res.render("user/user", { uinfo: user, user: req.user });
});
router.get(["/signup", "/login"], (req, res) => {
	if (req.user) res.redirect("/dashboard").end();

	res.render(`user${req.url}`, {});
});

/**
 * api
 */
// signup
router.post("/api/v1/user/signup", (req, res) => {
	req // check for missing fields
		.assert(req.body.email, 400, "Please input an email.", 1)
		.assert(req.body.username, 400, "Please input a username.", 1)
		.assert(req.body.password1, 400, "Please input a password.", 1)
		.assert(req.body.password2, 400, "Please confirm your password.", 1)
		.assert(req.body.password1 == req.body.password2, 400, "Passwords do not match.", 1)
		.assert(req.body.password1.length >= 3, 400, "Password is too short.", 1);

	const token = User.create(req.body.email, req.body.username, req.body.password1);
	res // set a cookie that expires in 1 year
		.cookie("utk", token, { path: "/", maxAge: 31557600000, httpOnly: true })
		.json({ status: "ok" });
});

// login
router.post("/api/v1/user/login", (req, res) => {
	req // check for missing fields
		.assert(req.body.email, 400, "Please input an email.", 1)
		.assert(req.body.password1, 400, "Please input a password.", 1)
		.assert(req.body.password1.length >= 3, 400, "Password is too short.", 1);

	try {
		const token = User.login(req.body.email, req.body.password1);
		res // set a cookie that expires in 1 year
			.cookie("utk", token, { path: "/", maxAge: 31557600000, httpOnly: true })
			.json({ status: "ok" });
	} catch (err) {
		console.error(err);
		res
			.status(500)
			.json({ status: "error", msg: "Internal server error."});
	}
});

module.exports = router;