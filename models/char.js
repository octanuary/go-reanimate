const fs = require("fs");
const mysql = require("mysql");
const util = require("../helpers/util");

module.exports = {
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
				fs.writeFileSync(`${__dirname}/../files/asset/${id}.xml`, body);
				fs.writeFileSync(`${__dirname}/../files/asset/${id}.png`, thumbdata);

				resolve(id);
			});
			connection.end();
		});
	},
	load(aId) {
		try {
			try { // custom characters
				return Buffer.from(fs.readFileSync(`${__dirname}/../files/asset/${aId}.png`));
			} catch (err) { // stock characters
				const nId = (aId.slice(0, -3) + "000").padStart(9, 0);
				const chars = fs.readFileSync(`${__dirname}/../static/characters/${nId}.txt`);

				var line = chars
					.toString("utf8")
					.split("\n")
					.find(v => v.substring(0, 3) == aId.slice(-3));
				if (line)
					return Buffer.from(line.substring(3));
				else
					throw "Character not found.";
			}	
		} catch (err) {
			throw "Character not found."
		}
	}
}