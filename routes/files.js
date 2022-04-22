const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/files/:type/:aId/:file", (req, res) => {
	const buffer = fs.readFileSync(`${__dirname}/../files/${req.params.type}/${req.params.file}/${req.params.aId}`);
	res.send(buffer);
})

module.exports = router;