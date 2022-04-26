// modules
const express = require("express");
const router = express.Router();
const fs = require("fs");
const JSZip = require("jszip");
// stuff
const themelist = require("../../themelist.json");

/**
 * api
 */
// themelist
router.post("/goapi/getThemelist", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

	const zip = new JSZip();
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
	zip.file("themelist.xml", xml);
	res
		.set("Content-Type", "application/zip")
		.end(await zip.generateAsync({ type: "nodebuffer" }));
});

// the theme itself
router.post("/goapi/getTheme", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

	const zip = new JSZip();
	// add theme xml to zip, that's it
	try {
		const xml = Buffer.from(fs.readFileSync(`${__dirname}/../../static/store/3a981f5cb2739137/${req.body.themeId}/theme.xml`));
		zip.file("theme.xml", xml);
		res
			.set("Content-Type", "application/zip")
			.end(await zip.generateAsync({ type: "nodebuffer" }));
	} catch (err) {
		console.error(err);
		res.goError(`Could not find theme.xml for theme ${req.body.themeId}`);
	}
});

module.exports = router;