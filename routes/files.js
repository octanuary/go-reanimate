// modules
const express = require("express");
const router = express.Router();
// stuff
const Asset = require("../models/asset");

router.get("/files/:type/:aId/", async (req, res) => {
	try {
		if (req.params.type == "asset") {
			const buffer = await Asset.load(req.params.aId);
			console.log(buffer);
			res.end(buffer);
		}
		else {
			const buffer = fs.readFileSync(`${__dirname}/../files/${req.params.type}/${req.params.file}/${req.params.aId}`);
			res.send(buffer);
		}
	} catch (err) {
		console.log(err);
		res.end();
	}
});
router.get("/files/:type/:aId/:file", async (req, res) => {
	try {
			const buffer = fs.readFileSync(`${__dirname}/../files/${req.params.type}/${req.params.file}/${req.params.aId}`);
			res.send(buffer);
		
	} catch (err) {
		console.log(err);
		res.end();
	}
});

module.exports = router;