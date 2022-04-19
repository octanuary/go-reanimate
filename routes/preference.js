const express = require("express");
const router = express.Router();

/**
 * frontend
 */
router.post("/api_v2/studio_preference/get", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}

 	res.json({ status: "ok", data: [] });
});

module.exports = router;