// modules
const fs = require("fs");
const JSZip = require("jszip");
const mysql = require("mysql");
const xmldoc = require("xmldoc");
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
		const zip = new JSZip();
		zip.loadAsync(body, { base64: true });

		// prepare stuff
		let ugc = '<theme id="ugc" name="ugc">';
		const film = new xmldoc.XmlDocument(await zip.file("movie.xml").async("string"));
		const meta = film.childNamed("meta");

		// start parsing the xml
		film.childrenNamed("scene").forEach(scene => {
			// scenes
			scene.eachChild(elem => {
				switch (elem.name) {
					case "bg":
					case "prop": {
						const file = elem.childNamed("file")?.val;

						console.log(file);
						// check if it's undefined
						if (!file) throw "Invalid movie XML."
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
			duration: film.attr("duration").val,
			tags: meta.childNamed("tag").val,
			published: film.attr("published") == 1,
			private: film.attr("pshare") == 1,
		};
	},
	save(user, body, thumbdata) {
		return new Promise((resolve, rej) => { 
			const id = util.randStr();
			thumbdata = Buffer.from(thumbdata, "base64");

			const movie = this.parse(body);
			const share = movie.published ? "published" : movie.private ? "private" : "draft"

			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = "INSERT INTO movie (id, creator_id, title, description, duration, tags, share, watermark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
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