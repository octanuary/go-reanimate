const express = require("express");
const router = express.Router();

/**
 * frontend
 */
// redirect requests to app links with no theme
router.get(["/go/character_creator/", "/go/videomaker/lite/"], (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.redirect("/go/videomaker");
});

/**
 * api
 */
// goapi (nobody should be accessing this)
router.all("/goapi", (req, res) => res.redirect("/signup"))

module.exports = router;