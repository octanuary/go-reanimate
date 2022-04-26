// modules
const express = require("express");
const router = express.Router();
// stuff
const Movie = require("../../models/movie");

/**
 * api
 */
router.post("/goapi/saveMovie", async (req, res) => {
	req
		.assert(req.user, 400, "You must be logged in to perform this action.", 2)
		.assert(req.body.body_zip, 400, "No movie zip provided.", 2);

	try {
		const id = await Movie.save(req.user, req.body.body, req.body.thumbdata);
		res.end(`0${id}`);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});

module.exports = router;