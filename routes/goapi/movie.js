// modules
const express = require("express");
const router = express.Router();
// vars
const nullBuff = Buffer.alloc(1, 0);
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
router.post("/goapi/getMovie/", async (req, res) => {
	req
		.assert(req.user, 400, "You must be logged in to perform this action.", 2)
		.assert(req.query.movieId, 400, "No movie ID provided.", 2);
	if (!req.isValid) return;

	let buffer;

	try {
		buffer = await Movie.load(req.user, req.body.movieId);
		res
			.set("Content-Type", "application/zip")
			.send(Buffer.concat([nullBuff, buffer]));
	} catch (err) {
		res.end(`1${err}`)
	}
});




router.post("/goapi/getMovieInfo/", (req, res) => {
	res.end("<?xml encoding=\"UTF-8\"?><watermarks><watermark style=\"visualplugin\"/></watermarks>");
})


module.exports = router;
