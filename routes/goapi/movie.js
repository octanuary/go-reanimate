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
		.assert(req.body.body_zip, 400, "No movie zip provided.", 2)
		// the lvm tries to autosave with no movie id or thumbnail,
		// so we just ignore it until the user actually saves a movie
		//.assert(!(req.body.is_triggered_by_autosave && !req.body.movieId), 200, "0");

	try {
		const id = await Movie.save(req.user, req.body.body_zip, req.body?.thumbnail_large, req.body?.movieId);
		console.log(id);
		res.end("0" + id);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});
router.get("/goapi/getMovie/", async (req, res) => {
	req
		.assert(req.user, 400, "You must be logged in to perform this action.", 2)
		.assert(req.body.body_zip, 400, "No movie zip provided.", 2)
		// the lvm tries to autosave with no movie id or thumbnail,
		// so we just ignore it until the user actually saves a movie
		//.assert(!(req.body.is_triggered_by_autosave && !req.body.movieId), 200, "0");

	try {
		const id = await Movie.save(req.user, req.body.body_zip, req.body?.thumbnail_large, req.body?.movieId);
		console.log(id);
		res.end("0" + id);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});


module.exports = router;
