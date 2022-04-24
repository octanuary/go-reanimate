const fs = require("fs");
const mysql = require("mysql");
const util = require("../helpers/util");

module.exports = {
	save(req, subtype, file) {
		return new Promise((resolve, rej) => {
			const id = util.randStr();
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
			const stmt = "INSERT INTO asset (id, creator_id, type, subtype, title, tags, duration, themeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			connection.query(stmt, [id, req.user.id, type.type, type.subtype, file.name, "", "NULL", "ugc"], (err, res, fields) => {
				if (err) rej(err);

				file.mv(`${__dirname}/../files/asset/file/${id}`, err => {
					if (err) rej(err);
					resolve({
						id: id,
						type: type.type,
						subtype: type.subtype,
						title: file.name
					});
				});
			});
			connection.end();
		});
	},
	list(type, subtype, themeId) {
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

				console.log(res);
				const filterRes = themeId ? res.filter(v => v.themeId == themeId) : res
				resolve(filterRes);
			});
			connection.end();
		});
	},
	load(aId) {
		try {
			return fs.readFileSync(`${__dirname}/../files/asset/file/${aId}`);
		} catch (err) {
			throw "Asset does not exist."
		}
	}
}