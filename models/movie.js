const fs = require("fs");
const mysql = require("mysql");
const util = require("../helpers/util");

module.exports = {
	parse() {

	},
	save(req, body, thumbdata) {
		return new Promise((resolve, rej) => { 
			const id = util.randStr();
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
				fs.writeFileSync(`${__dirname}/../files/movie/file/${id}`, body);
				fs.writeFileSync(`${__dirname}/../files/movie/thumb/${id}`, thumbdata);

				resolve(id);
			});
			connection.end();
		});
	}
}