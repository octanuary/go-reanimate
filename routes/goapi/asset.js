const Asset = require("../../models/asset");
const express = require("express");
const router = express.Router();

async function createXML(type, subtype = 0, themeId) {
	var response, files;
	switch (type) {
		case "char": {
			switch (themeId) { // fix theme id
				case "custom": {
					themeId = "family";
					break;
				}
				case "action": {
					themeId = "cc2";
					break;
				}
			}
			files = await Asset.list("char", 0, themeId);
			response = `<ugc more="0">${files
				.map(v => `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" cc_theme_id="${v.themeId}" thumbnail_url="/files/asset/${v.id}.png" copyable="Y"><tags>${v.tags}</tags></char>`)
				.join("")}</ugc>`;
			break;
		}
		case "bg": {
			files = await Asset.list("bg", subtype);
			response = `<ugc more="0">${files
				.map(v => `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/files/asset/${v.id}"/>`)
				.join("")}</ugc>`;
			break;
		}
		case "movie": {
			files = Asset.list("movie");
			response = {
				"status": "ok",
				"data": {
					"xml": `<ugc more="0">${files
						.map(v => `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${v.name}" thumbnail_url="/assets/${v.id}.png"><tags></tags></movie>`)
						.join("")}</ugc>`
				}
			};
			break;
		}
		case "prop": {
			if (subtype == 0) {
				files = await Asset.list("prop", subtype);
				response = `<ugc more="0">${files
					.map(v => `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/files/asset/${v.id}"/>`)
					.join("")}</ugc>`;
			} else {
				files = await Asset.list("prop", "video");
				response = {
					"status": "ok",
					"data": {
						"xml": `<ugc more="0">${files
							.map(v => `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`)
							.join("")}</ugc>`
					}
				};
			}
			break;
		}
		case "sound": {
			files = Asset.list("sound");
			response = {
				"status": "ok",
				"data": {
					"xml": `<ugc more="0">${files
						.map(v => `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`)
						.join("")}</ugc>`
				}
			};
			break;
		}
		default: { // no type? send a blank response
			response = {
				"status": "ok",
				"data": {
					"xml": `<ugc more="0"></ugc>`
				}
			};
			break;
		}
	};
	return response;
}

/**
 * api
 */
// listing
router.post("/api_v2/assets/imported", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);
	req // check for missing fields
		.assert(req.body.data.type, 400, "", 1);

	try {
		const list = await createXML(req.body.data.type, req.body.data.subtype, req.body.data?.themeId);
		res.json({
			status: "ok",
			data: {
				xml: list
			}
		});
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});
// asset uploading
router.post("/api/v1/assets/import", async (req, res) => {
	req // check for missing fields
		.assert(req.files.file, 400, "NO. FILE. FUCK. YOU.", 1)
		.assert(req.body.subtype, 400, "NO. SUBTYPE. FUCK. YOU.", 1);

	try {
		const info = await Asset.save(req, req.body.subtype, req.files.file);
		res.json({
			status: "ok",
			id: info.id,
			encrypt_id: info.id,
			filename: `/files/asset/${info.id}/file`,
			data: {
				file: `/files/asset/${info.id}/file`,
				enc_asset_id: info.id,
				title: info.title,
				tags: ""
			}
		});
	} catch {
		res.json({
			status: "error",
			msg: "Internal server error."
		});
	}
});


module.exports = router;