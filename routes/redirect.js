const themelist = require("../themelist.json");
const express = require("express");
const router = express.Router();

/**
 * frontend
 */
// character creator (no theme)
router.get("/go/character_creator/", (req, res) => {
	if (!req.user) res.redirect("/login").end();

	res.redirect("/themelist");
});

// quick videomaker (no theme)
router.get("/go/videomaker/lite/", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.redirect("/themelist");
});

/**
 * api
 */
// goapi (nobody should be accessing this)
router.all("/goapi", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.redirect("/themelist");
})

module.exports = router;