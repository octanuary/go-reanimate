const themelist = require("../themelist.json");
const express = require("express");
const router = express.Router();

/**
 * frontend
 */
// choose a theme page
router.get("/themelist", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}

 	res.render("themelist", { themelist: themelist, user: req.user });
});

// full videomaker
router.get("/videomaker/full/:tId?/:mId?", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}
 	res.render("studio", {
		themeId: req.params.tId || "custom",
		movieId: req.params.mId || "",
		themelist: themelist,
		user: req.user || {}
	});
});

module.exports = router;