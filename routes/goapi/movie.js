const Movie = require("../../models/movie");
const express = require("express");
const router = express.Router();

router.post("/goapi/saveMovie", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);
	req
		.assert(req.body.body_zip, 400, "")
		.assert(req.body.thumbdata, 400, "");

	try {
		const id = await Movie.save(req, req.body.body, req.body.thumbdata);
		res.end(`0${id}`);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});

router.post("/goapi/getCCCharCompositionXml/", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);
	req.assert(req.body.assetId, 400, "");

	try {
		const char = Char.load(req.body.assetId);
		res.end(`0${char}`);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});

module.exports = router;