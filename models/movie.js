// modules
const fs = require("fs");
const JSZip = require("jszip");
const mysql = require("mysql");
const path = require("path");
const xmldoc = require("xmldoc");
// vars
const storeP = path.join(__dirname, "../static/store/3a981f5cb2739137");
const header = process.env.XML_HEADER;
// stuff
const Asset = require("./asset");
const Char = require("./char");
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

async function meta2Xml(v) {
	var xml;
	switch (v.type) {
		case "char": {
			xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="Untitled" cc_theme_id="${v.themeId}" thumbnail_url="/files/asset/${v.id}.png" copyable="Y"><tags/></char>`;
			break;
		}
		case "bg": {
			xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/files/asset/${v.id}"/>`;
			break;
		}
		case "movie": {
			xml = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${v.name}" thumbnail_url="/assets/${v.id}.png"><tags></tags></movie>`;
			break;
		}
		case "prop": {
			if (subtype == 0) 
				xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/files/asset/${v.id}"/>`;
			else 
				xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`;
			break;
		}
		case "sound": {
			xml = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
			break;
		}
	};
	return xml;
}

function addToThemelist(theme, themelist) {
	if (!themelist.find(t => t == theme))
		themelist.push(theme);
}

module.exports = {
	/**
	 * @summary Takes a base64 encoded blank movie zip, adds assets to it, and returns a new zip.
	 * @param {String} body 
	 * @returns {Buffer}
	 */
	parse(body) {
		return new Promise(async (res, rej) => {
			const zip = await new JSZip().loadAsync(body);

			// prepare stuff
			let ugc = '<theme id="ugc" name="ugc">';
			let themelist = ["common"];
			const xml = await zip.file("movie.xml").async("string");
			const film = new xmldoc.XmlDocument(xml);
			const meta = film.childNamed("meta");

			for (elemIn in film.children) {
				const elem = film.children[elemIn];

				switch (elem.name) {
					case "scene": {
						for (elem2In in elem.children) {
							const elem2 = elem.children[elem2In];

							switch (elem2.name) {
								case "bg":
								case "prop": {
									const file = elem2.childNamed("file")?.val;
									if (!file) rej(new Error("Invalid movie XML."));
									const pieces = file.split(".");
									addToThemelist(pieces[0], themelist);
		
									// add the extension to the last key
									const ext = pieces.pop();
									pieces[pieces.length - 1] += "." + ext;
									pieces.splice(1, 0, elem2.name);
									
									// add the file to the zip
									const filepath = path.join(storeP, pieces.join("/"));
									const filename = pieces.join(".");
									zip.file(filename, fs.readFileSync(filepath));
		
									break;
								}
								case "char": {
									console.log("char pasre");
									const file = elem2.childNamed("action")?.val;
									if (!file) rej(new Error("Invalid movie XML."));
									const pieces = file.split(".");
									const themeId = pieces[0];
									const id = pieces[1];
			
									// fix the file name
									// remove the action part (if it's a custom char)
									if (themeId == "ugc") pieces.splice(2, 1);
									// add the extension to the last key
									const ext = pieces.pop();
									pieces[pieces.length - 1] += "." + ext;
									pieces.splice(1, 0, elem2.name);
			
									switch (themeId) {
										case "ugc": {
											const filename = pieces.join(".");
			
											// add character meta
											// i can't just select the character data because of stock chars
											ugc += await meta2Xml({
												id: id,
												type: "char",
												themeId: Char.theme(id)
											});
											// and add the character file
											zip.file(filename, Char.load(id));
											break;
										}
										default: {
											const filename = pieces.join(".");
			
											
											// and add the character file
											zip.file(filename, Char.load(id));
											break;
										}
									}
									break;
								}
							}
						}
					}
				}
			}

			// add files to the zip
			// themelist
			let themelXml = `${header}\n<themes>`;
			themelist.forEach(theme => {
				themelXml += `<theme>${theme}</theme>`;

				// add the theme xml to the zip
				const filepath = path.join(storeP, `${theme}/theme.xml`);
				const filename = theme + ".xml";
				zip.file(filename, fs.readFileSync(filepath));
			});
			themelXml += "</themes>";
			zip.file("themelist.xml", Buffer.from(themelXml));
			// ugc.xml
			ugc += "</theme>";
			zip.file("ugc.xml", Buffer.from(ugc));
			
			// return the parsed zip + some metadata
			res({
				zip: await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
				title: meta.childNamed("title").val,
				description: meta.childNamed("desc").val,
				duration: film.attr.duration,
				tags: meta.childNamed("tag").val,
				published: film.attr.published == 1,
				private: film.attr.pshare == 1,
			});
		});
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

			return Buffer.from(fs.readFileSync(`${__dirname}/../files/movie/file/${mId}.zip`));
		} catch (err) {
			console.log(err);
			throw new Error("Movie not found.");
		}
	}
}