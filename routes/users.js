const express = require("express");
const router = express.Router();
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
router.get("/signup", (req, res) => {
	if (req.user) res.redirect("/dashboard").end();

	res.render("user/signup", {}, (err, html) => res.send(html))
});

/**
 * api
 */
router.post("/api/v1/user/signup", (req, res) => {
	req // check for missing fields
		.assert(req.body.email, 400, "Please input an email.")
		.assert(req.body.username, 400, "Please input a username.")
		.assert(req.body.password1, 400, "Please input a password.")
		.assert(req.body.password2, 400, "Please confirm your password.")
		.assert(req.body.password1 == req.body.password2, 400, "Passwords do not match.")
		.assert(req.body.password1.length >= 3, 400, "Password is too short.");

	const token = User.create(req.body.email, req.body.username, req.body.password1);
	res // set a cookie that expires in 1 year
		.cookie("utk", token, { path: "/", maxAge: 31557600000, httpOnly: true })
		.json({ status: "ok" });
});

module.exports = router;