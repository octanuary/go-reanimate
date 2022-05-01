/** 
 * Go!ReAnimate
 */

// modules
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
var http = require("http").Server(app);
var io = require("socket.io")(http);
// vars
require("dotenv").config();

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

io.on('connection', () =>{
    console.log('a user is connected')
  })

app.use((req, res, next) => {
    io.emit('message', "whende");
    next();
})
http.listen(4343, () => console.log("Go!ReAnimate"));