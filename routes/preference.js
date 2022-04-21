const express = require("express");
const router = express.Router();

/**
 * frontend
 */
router.post("/api_v2/studio_preference/get", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.json({ status: "ok", data: [] });
});

module.exports = router;