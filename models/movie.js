// modules
const fs = require("fs");
const JSZip = require("jszip");
const mysql = require("mysql");
const path = require("path");
const xmldoc = require("xmldoc");
// vars
const storeP = "../static/store/3a981f5cb2739137";
// stuff
const util = require("../helpers/util");

// gets the font filename from a font name
function name2Font(font) {
	switch (font) {
		case "Blambot Casual":
			return "FontFileCasual";
		case "BadaBoom BB":
			return "FontFileBoom";
		case "Entrails BB":
			return "FontFileEntrails";
		case "Tokyo Robot Intl BB":
			return "FontFileTokyo";
		case "Accidental Presidency":
			return "FontFileAccidental";
		case "Budmo Jiggler":
			return "FontFileBJiggler";
		case "Budmo Jigglish":
			return "FontFileBJigglish";
		case "Existence Light":
			return "FontFileExistence";
		case "HeartlandRegular":
			return "FontFileHeartland";
		case "Honey Script":
			return "FontFileHoney";
		case "I hate Comic Sans":
			return "FontFileIHate";
		case "loco tv":
			return "FontFileLocotv";
		case "Mail Ray Stuff":
			return "FontFileMailRay";
		case "Mia\'s Scribblings ~":
			return "FontFileMia";
		case "Coming Soon":
			return "FontFileCSoon";
		case "Lilita One":
			return "FontFileLOne";
		case "Telex Regular":
			return "FontFileTelex";
		case "":
		case null:
			return "";
		default:
			return `FontFile${font.replace(/\s/g, '')}`;
	}
}

module.exports = {
	/**
	 * @summary Takes a base64 encoded blank movie zip, adds assets to it, and returns a new zip.
	 * @param {String} body 
	 * @returns {Buffer}
	 */
	async parse(body) {
		const zip = await new JSZip().loadAsync(body);

		// prepare stuff
		let ugc = '<theme id="ugc" name="ugc">';
		const xml = await zip.file("movie.xml").async("string");
		const film = new xmldoc.XmlDocument(xml);
		const meta = film.childNamed("meta");

		// start parsing the xml
		film.childrenNamed("scene").forEach(scene => {
			// scenes
			scene.eachChild(elem => {
				switch (elem.name) {
					case "bg":
					case "prop": {
						const file = elem.childNamed("file")?.val;
						if (!file) throw new Error("Invalid movie XML.");
						const pieces = file.split(".");

						// fix file name because the lvm fucks it up
						const ext = pieces.pop();
						pieces[pieces.length - 1] += "." + ext;
						pieces.splice(1, 0, elem.name);
						
						const filepath = path.join(__dirname, storeP, pieces.join("/"));
						const filename = pieces.join(".")

						zip.file(filename, fs.readFileSync(filepath));
					}
				}
			});
		});

		// add files to the zip
		
		// return the parsed zip + some metadata
		return {
			zip: await zip.generateAsync({ type: "nodebuffer" }),
			title: meta.childNamed("title").val,
			description: meta.childNamed("desc").val,
			duration: film.attr.duration,
			tags: meta.childNamed("tag").val,
			published: film.attr.published == 1,
			private: film.attr.pshare == 1,
		};
	},
	save(user, body, thumbdata, id) {
		return new Promise(async (resolve, rej) => { 
			id ||= util.randStr();
			// get the buffers from base64
			body = Buffer.from(body, "base64");
			thumbdata = Buffer.from(thumbdata, "base64");

			// parse the movie, and get some metadata
			const movie = await this.parse(body);
			const share = movie.published ? "published" : movie.private ? "private" : "draft"

			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = "REPLACE INTO movie (id, creator_id, title, description, duration, tags, share, watermark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			connection.query(stmt, [id, user.id, movie.title, movie.description, movie.duration, movie.tags, share, "0vTLbQy9hG7k"], (err, res, fields) => {
				if (err) rej(err);

				// save the files
				fs.writeFileSync(`${__dirname}/../files/movie/file/${id}.zip`, movie.zip);
				fs.writeFileSync(`${__dirname}/../files/movie/thumb/${id}.png`, thumbdata);

				resolve(id);
			});
			connection.end();
		});
	},
	load(user, mId) {
		try {
			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = "SELECT * FROM movie WHERE id = ?";
			connection.query(stmt, [mId], (err, res, fields) => {
				if (err) throw err;
				if (res.length == 0) throw "Movie not found.";

				// filter columns
				if (res[0].creator_id !== user.id && res[0].share !== "public") throw "This movie does not belong to you.";
			});
			connection.end();

			return Buffer.from(fs.readFileSync(`${__dirname}/../files/movie/${mId}.zip`));
		} catch (err) {
			throw "Character not found."
		}
	}
}