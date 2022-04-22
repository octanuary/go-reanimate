const Asset = require("../models/asset");
const express = require("express");
const router = express.Router();

async function createXML(type, subtype, themeId) {
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
				.map(v => `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" cc_theme_id="${v.themeId}" thumbnail_url="/files/asset/${v.id}/thumb" copyable="Y"><tags>${v.tags}</tags></char>`)
				.join("")}</ugc>`;
			break;
		}
		case "bg": {
			files = Asset.list("bg");
			response = {
				"status": "ok",
				"data": {
					"xml": `<ugc more="0">${files
						.map(v => `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`)
						.join("")}</ugc>`
				}
			};
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
			if (data.subtype) {
				files = Asset.list("prop", "video");
				response = {
					"status": "ok",
					"data": {
						"xml": `<ugc more="0">${files
							.map(v => `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`)
							.join("")}</ugc>`
					}
				};
			} else {
				files = Asset.list("prop");
				response = {
					"status": "ok",
					"data": {
						"xml": `<ugc more="0">${files
							.map(v => `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.id}"/>`)
							.join("")}<folder id="fidogd" name="DIE"/></ugc>`
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

router.post("/goapi/getUserAssetsXml/", async (req, res) => {
	if (!req.user) res.goError(`You must be logged in to perform this action.`);
	req // check for missing fields
		.assert(req.body.type, 400, "");
	try {
		const list = await createXML(req.body.type, req.body.subtype, req.body.themeId);
		res.end(list);
	} catch (err) {
		if (process.env.NODE_ENV == "development") throw err;
		res.end(`1${err}`);
	}
});

module.exports = router;