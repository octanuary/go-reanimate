const assetTags = require("../../assetTags.json");
const express = require("express");
const router = express.Router();

/**
 * stuff
 */
router.use("/", require("./app"));
router.use("/", require("./asset"));
router.use("/", require("./char"));
router.use("/", require("./theme"));

/**
 * general routes
 */
router.get("/goapi", (req, res) => res.redirect("/").end());
router.get("/crossdomain.xml", (req, res) => res.end("<cross-domain-policy><site-control permitted-cross-domain-policies=\"by-content-type\"/></cross-domain-policy>"));
router.get("/goapi/getAssetTags", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.json(assetTags);
});
router.post("/goapi/getCCPreMadeCharacters", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.end();
});


module.exports = router;