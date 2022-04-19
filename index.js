/** 
 * GoAniverse
 */
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const minifyHTML = require("express-minify-html");

/**
 * express configuration
 */
// config
app.set("views", "views");
app.set("view engine", "ejs");
// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(require("cookie-parser")());
app.use(minifyHTML({
	override: true,
	exception_url: false,
	htmlMinifier: {
		removeComments: true,
		collapseWhitespace: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeEmptyAttributes: true,
		minifyJS: true
	}
}));
if (process.env.NODE_ENV == "production") {
	app.set("trust proxy", 1);
}
app.use(morgan("combined"));
// routes
app.use("/static", express.static("static"));
app.use(require("./middlewares/extended"));
app.use(require("./routes"));

app.listen(4343, () => console.log("GoAnimate is running."));