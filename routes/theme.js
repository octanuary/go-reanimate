const themelist = require("../themelist.json");
const express = require("express");
const router = express.Router();
const nodezip = require("node-zip");
const addToZip = require("../helpers/zip");
const fs = require("fs");

/**
 * frontend
 */
router.post("/goapi/getThemelist", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}

	const zip = nodezip.create();
	// generate an xml list of themes
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
		<list version="1.0">
			<fvm_meta theme_code="" is_biz="0" />
			${themelist.map(v => `<theme id="${v.id}" name="${v.name}" thumb="" cc_theme_id="${v.cc_theme_id}" enable="${(v.features.vm == true) ? "Y": "N"}" />`).join("\n")}
			<word></word>
			<whiteword />
			<excludeAssetIDs />
			<points money="${req.user.gobucks}" sharing="0" />
		</list>`;
	addToZip(zip, "themelist.xml", xml);
 	zip.zip().then(buffer => res.end(buffer));
});

router.post("/goapi/getTheme", (req, res) => {
	if (!req.user) { // check if the user is signed in
		res.redirect("/login").end();
		return;
	}

	const zip = nodezip.create();
	// add theme xml to zip, that's it
	addToZip(zip, "theme.xml", fs.readFileSync(`${__dirname}/../static/store/3a981f5cb2739137/${req.body.themeId}/theme.xml`));
 	zip.zip().then(buffer => res.end(buffer));
});

module.exports = router;