const themelist = require("../themelist.json");
const express = require("express");
const router = express.Router();

/**
 * frontend
 */
// choose a theme page
router.get("/themelist", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.render("app/themelist", { themelist: themelist, user: req.user });
});

// character creator
router.get("/go/character_creator/:tId/new_char", (req, res) => {
	if (!req.user) res.redirect("/login").end();

	// validate the theme id
	const themeId = (themelist.find(v => v.cc_theme_id == req.params.tId && v.features.cc)) ? req.params.tId : "family";

 	res.render("app/cc", {
		themeId: themeId,
		bs: req.query.type || "adam",
		charId: req.params.mId || "",
		themelist: themelist,
		user: req.user
	});
});
router.get("/go/character_creator/:tId/copy/:cId", (req, res) => {
	if (!req.user) res.redirect("/login").end();

	// validate the theme id
	const themeId = (themelist.find(v => v.cc_theme_id == req.params.tId && v.features.cc)) ? req.params.tId : "family";

 	res.render("app/cc", {
		themeId: themeId,
		bs: req.query.type || "adam",
		charId: req.params.cId,
		themelist: themelist,
		user: req.user
	});
});

// character browser
router.get("/go/character_creator/:tId?", (req, res) => {
	if (!req.user) res.redirect("/login").end();
	if (!req.params.tId) res.redirect("/themelist").end();

	// validate the theme id
	const themeId = (themelist.find(v => v.cc_theme_id == req.params.tId && v.features.cc)) ? req.params.tId : "family";

 	res.render("app/cc_browser", {
		themeId: themeId,
		themelist: themelist,
		user: req.user
	});
});

// full videomaker
router.get("/go/videomaker/full/:tId?/:mId?", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.render("app/studio", {
		themeId: req.params.tId || "custom",
		movieId: req.params.mId || "",
		themelist: themelist,
		user: req.user
	});
});

// quick videomaker
router.get("/go/videomaker/lite/:tId/", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.render("app/golite", {
		themeId: req.params.tId || "custom",
		movieId: req.params.mId || "",
		themelist: themelist,
		user: req.user
	});
});

module.exports = router;