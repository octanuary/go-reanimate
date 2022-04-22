const assetTags = require("../assetTags.json");
const express = require("express");
const router = express.Router();

/**
 * stuff
 */
router.use("/", require("./app"));
router.use("/", require("./asset"));
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
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.json(assetTags);
});
router.post("/goapi/getCCPreMadeCharacters", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

 	res.end(`<cc_char xscale='1' yscale='1' hxscale='1' hyscale='1' headdx='0' headdy='0'><color r="ccSkinColor">0xE2C294</color><color r="ccEyeLib">0xBD8764</color><color r="ccEyeIris">0x003333</color><color r="ccGlassesFrame">0xBE10B0</color><color r="ccGlassesLens">0x737373</color><color r="ccMouthLip">0xB7796A</color><color r="ccEyebrow">0x421D0B</color><color r="ccBackMajor">0x000000</color><color r="ccBackMinor">0x000000</color><color r="ccLowerMain">0x2D2928</color><color r="ccHairMajor">0x7E4D1B</color><component type="bodyshape" component_id="default" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="freeaction" component_id="default" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="eyebrow" component_id="002" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="ear" component_id="003" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="hair" component_id="058" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="nose" component_id="007" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="mouth" component_id="008" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="eye" component_id="003" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><component type="faceshape" component_id="007" theme_id="cc2" x="0" y="0" xscale="1" yscale="1" offset="0" rotation="0"/><library type="GoHands" component_id="001" theme_id="cc2"/><library type="GoLower" component_id="001" theme_id="cc2"/><library type="GoUpper" component_id="2006" theme_id="cc2"/></cc_char>`);
});


module.exports = router;