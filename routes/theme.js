const express = require("express");
const router = express.Router();
const fs = require("fs");
const nodezip = require("node-zip");
const themelist = require("../themelist.json");
const addToZip = require("../helpers/addToZip");

/**
 * api
 */
// themelist
router.post("/goapi/getThemelist", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

	const zip = nodezip.create();
	// generate an xml list of themes
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
		<list version="1.0">
			<fvm_meta theme_code="" is_biz="0" />
			${themelist.map(v => (v.features.vm) ? `<theme id="${v.id}" name="${v.name}" thumb="" cc_theme_id="${v.cc_theme_id}" enable="Y"/>` : "").join("")}
			<word></word>
			<whiteword />
			<excludeAssetIDs />
			<points money="${req.user.gobucks}" sharing="0" />
		</list>`;
	addToZip(zip, "themelist.xml", xml);
 	zip.zip().then(buffer => res.end(buffer));
});

// the theme itself
router.post("/goapi/getTheme", (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

	const zip = nodezip.create();
	// add theme xml to zip, that's it
	addToZip(zip, "theme.xml", fs.readFileSync(`${__dirname}/../static/store/3a981f5cb2739137/${req.body.themeId}/theme.xml`));
 	zip.zip().then(buffer => res.end(buffer));
});

module.exports = router;