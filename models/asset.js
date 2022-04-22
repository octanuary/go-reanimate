const fs = require("fs");
const mysql = require("mysql");
const util = require("../helpers/util");

module.exports = {
	save(req, body, thumbdata) {
		return new Promise((resolve, rej) => { 
			const id = util.randStr();
			body = Buffer.from(body, "base64");
			thumbdata = Buffer.from(thumbdata, "base64");

			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = "INSERT INTO asset (id, creator_id, type, subtype, title, tags, duration, themeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
			connection.query(stmt, [id, req.user.id, "char", 0, "Untitled", "", "NULL", req.body.themeId], (err, res, fields) => {
				if (err) rej(err);

				// save the files
				fs.writeFileSync(`${__dirname}/../files/asset/${id}`, body);
				fs.writeFileSync(`${__dirname}/../files/asset/${id}`, thumbdata);

				resolve(id);
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
				const filterRes = (themeId) ? res.filter((v) => v.themeId == themeId) : res
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