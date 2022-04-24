/** 
 * GoAniverse
 */
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const minifyHTML = require("express-minify-html");

/**
 * middlewares
 */
app.set("views", "views");
app.set("view engine", "ejs");
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
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.use(morgan("tiny"));
app.use("/static", express.static("static"));
app.use(require("./middlewares/extended"));
app.use(require("./routes"));

app.listen(4343, () => console.log("GoReanimate is running."));