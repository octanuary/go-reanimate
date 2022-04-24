const express = require("express");
const router = express.Router();

/**
 * stuff
 */
router.use("/", require("./goapi/index.js"));
router.use("/", require("./files"));
router.use("/", require("./preference"));
router.use("/", require("./users"));

module.exports = router;