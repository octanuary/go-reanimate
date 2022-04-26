/** 
 * GoAniverse
 */
require("dotenv").config();
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

/**
 * middlewares
 */
app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false, limit: "8mb" }));
app.use(express.json({ limit: "8mb" }));
app.use(require("cookie-parser")());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
app.use("/static", express.static("static"));
app.use(require("./middlewares/extended"));
app.use(require("./routes"));

app.listen(4343, () => console.log("GoReanimate is running."));