// modules
const res = require("express/lib/response");
const fs = require("fs");
const sharp = require("sharp");
const mysql = require("mysql");
const path = require("path");
// stuff
const util = require("../helpers/util");
const folder = path.join(__dirname, "../files/asset/");

module.exports = {
	save(req, subtype, file) {
		return new Promise((resolve, rej) => {
			const id = util.randStr();

			// get the type and subtype from just the subtype
			let type = {};
			switch (subtype) {
				case "bgmusic":
				case "soundeffect":
				case "voiceover": {
					type = {
						type: "sound",
						subtype: subtype
					};
					break;
				}
				case "bg":
				case "prop": {
					type = {
						type: subtype,
						subtype: 0
					};
					break;
				}
			}

			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			// add the asset to the database
			const stmt = "INSERT INTO asset (id, creator_id, type, subtype, title, tags, share, duration, themeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			connection.query(stmt, [id, req.user.id, type.type, type.subtype, file.name, "none", "", "NULL", "ugc"], async (err, res, fields) => {
				if (err) rej(err);

				// we need to validate the file type
				const { fileTypeFromBuffer } = await import("file-type");
				let buffer = fs.readFileSync(file.tempFilePath);
				const filetype = await fileTypeFromBuffer(buffer);

				// resize the background, if it's a bg
				if (filetype.mime.startsWith("image") && type.type == "bg") {
					buffer = sharp(input)
						.resize({ width: 550 })
						.toBuffer();
				}
				
				fs.writeFileSync(path.join(folder, `${id}.${filetype.ext}`), buffer);

				resolve({
					id: id,
					type: type.type,
					subtype: type.subtype,
					title: file.name
				});
				fs.unlinkSync(file.tempFilePath);
			});
			connection.end();
		});
	},
	list(type, subtype, themeId, share) {
		return new Promise((resolve, rej) => {
			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = `SELECT * FROM asset WHERE type = ? AND subtype = ?`;
			connection.query(stmt, [type, subtype], (err, res, fields) => {
				if (err) rej(err);

				// filter columns
				let filterRes = themeId ? res.filter(v => v.themeId == themeId) : res
				filterRes = share ? res.filter(v => v.share == share) : res

				resolve(filterRes);
			});
			connection.end();
		});
	},
	meta(aId) {
		return new Promise((resolve, rej) => {
			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = `SELECT * FROM asset WHERE id = ?`;
			connection.query(stmt, [aId], (err, res, fields) => {
				if (err) rej(err);
				if (res.length <= 0) rej;

				resolve(res[0]);
			});
			connection.end();
		});
	},
	load(aId) {
		return new Promise((resolve, rej) => {
			try {
				fs.readdirSync(folder).forEach(v => {
					const filename = path.basename(v);
					const exti = filename.lastIndexOf(".");

					if (filename.substring(0, exti) == path.basename(aId))
						resolve(fs.readFileSync(path.join(folder, v)));
				});
				rej("Asset not found.")
			} catch (err) {
				console.log(err);
				rej("Asset not found.");
			}
		});
	}
}