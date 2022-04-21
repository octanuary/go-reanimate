const Char = require("../models/char");
const express = require("express");
const router = express.Router();

router.post("/goapi/saveCCCharacter", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);

	req // check for missing fields
		.assert(req.body.body, 400, "")
		.assert(req.body.thumbdata, 400, "");

	try {
		const id = await Char.save(req, req.body.body, req.body.thumbdata);
		res.end(`0${id}`);
	} catch (err) {
		res.end(`1${err}`);
	}
});

module.exports = router;