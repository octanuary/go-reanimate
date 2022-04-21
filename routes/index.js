const assetTags = require("../assetTags.json");
const express = require("express");
const router = express.Router();

/**
 * stuff
 */
router.use("/", require("./app"));
router.use("/", require("./char"));
router.use("/", require("./files"));
router.use("/", require("./preference"));
router.use("/", require("./theme"));
router.use("/", require("./users"));

/**
 * general routes
 */
router.get("/goapi", (req, res) => res.redirect("/").end());
router.get("/crossdomain.xml", (req, res) => res.end("<cross-domain-policy><site-control permitted-cross-domain-policies=\"by-content-type\"/></cross-domain-policy>"));
router.get("/goapi/getAssetTags", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.json(assetTags);
});
router.post("/goapi/getCCPreMadeCharacters", (req, res) => {
	if (!req.user) res.redirect("/login").end();

 	res.end();
});


module.exports = router;