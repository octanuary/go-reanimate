/** 
 * routes
 */
const assetTags = require("../assetTags.json");
const express = require("express");
const router = express.Router();

/**
 * stuff
 */
router.use("/", require("./app"));
router.use("/", require("./preference"));
router.use("/", require("./theme"));
router.use("/", require("./users"));

/**
 * general routes
 */
router.get("/unsupported-browser", (req, res) => {
	res.render("unsupported-browser", {});
});
router.get("/crossdomain.xml", (req, res) => res.end("<cross-domain-policy><site-control permitted-cross-domain-policies=\"by-content-type\"/></cross-domain-policy>"))
router.get("/goapi/getAssetTags", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}
 	res.json(assetTags);
});


module.exports = router;