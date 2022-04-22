const SECRET = process.env.AUTH_SECRET;
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const util = require("../helpers/util");

module.exports = {
	create(email, username, password) {
		const id = util.randStr();
		const token = jwt.sign({ email: email, password: password }, SECRET);
		password = CryptoJS.AES.encrypt(password, SECRET).toString();

		const connection = mysql.createConnection({
			host: process.env.SQL_HOST,
			user: process.env.SQL_USER,
			password: process.env.SQL_PASS,
			database: process.env.SQL_DB
		});
		const stmt = "INSERT INTO user (id, username, bio, email, password, gobucks) VALUES (?, ?, ?, ?, ?, ?)";
		connection.query(stmt, [id, username, "Hi! I'm new here.", email, password, 15], (err, res, fields) => {
			if (err) throw err;
		});
		connection.end();
		return token;
	},
	follows(mode, id) {
		// valid modes: following, follower
		return new Promise((resolve, rej) => {
			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = `SELECT * FROM follows WHERE ${mode} = ?`;
			// select the user data
			connection.query(stmt, [id], (err, res, fields) => {
				if (err) rej();

				resolve(res);
			});
			connection.end();
		})
	},
	getUserByToken(token) {
		return new Promise((resolve, rej) => {
			// verify the token
			jwt.verify(token, SECRET, function (err, decoded) {
				if (err) rej();
	
				const connection = mysql.createConnection({
					host: process.env.SQL_HOST,
					user: process.env.SQL_USER,
					password: process.env.SQL_PASS,
					database: process.env.SQL_DB
				});
				const stmt = "SELECT * FROM user WHERE email = ?";
				// select the user data
				connection.query(stmt, [decoded.email], async (err, res, fields) => {
					if (err) rej();
					if (res.length == 0) rej();
	
					// verify the password
					const password = CryptoJS.AES.decrypt(res[0].password, SECRET).toString(CryptoJS.enc.Utf8);
					if (password != decoded.password) rej;
	
					Object.assign(res[0], {
						password: password,
						token: token,
						followers: await this.follows("following", id),
						following: await this.follows("follower", id)
					});
					resolve(res[0]);
				});
				connection.end();
			});
		})
	},
	getUserById(id) {
		return new Promise((resolve, rej) => {
			const connection = mysql.createConnection({
				host: process.env.SQL_HOST,
				user: process.env.SQL_USER,
				password: process.env.SQL_PASS,
				database: process.env.SQL_DB
			});
			const stmt = "SELECT * FROM user WHERE id = ?";
			// select the user data
			connection.query(stmt, [id], async (err, res, fields) => {
				if (err) rej();
				if (res.length == 0) rej();

				Object.assign(res[0], {
					followers: await this.follows("following", id),
					following: await this.follows("follower", id)
				});
				resolve(res[0]);
			});
			connection.end();
		})
	}
}