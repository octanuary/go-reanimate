var FileMIME = {
	exts: {
		jpeg: "image/jpeg",
		jpg: "image/jpeg",
		png: "image/png",
		bmp: "image/bmp",
		gif: "image/gif",
		swf: "application/x-shockwave-flash",
		mp3: "audio/mpeg",
		aiff: "audio/aiff",
		m4a: "audio/x-aac",
		wav: "audio/x-wav",
		zip: "application/zip",
		xml: "text/xml",
		flv: "video/x-flv",
		mp4: "video/mp4",
		ttf: "font/x-font-ttf",
		otf: "font/vnd.ms-opentype"
	},
	guess: function (a) {
		var b = a.split(".").pop();
		b = b.toLowerCase();
		if (FileMIME.exts[b]) {
			return FileMIME.exts[b]
		}
		return "unknown"
	}
};

function showImporter() {
	if (!show_importer) {
		show_importer = true;
		ajust_studio();
		var a = $(".ga-importer");
		console.log(a);
		if (!a.data("importer")) {
			var b = false;
			if ($("#studio_holder").length) {
				b = studioApi($("#studio_holder"))
			}
			if (!!(window.ProgressEvent && window.FormData)) {
				a.data("importer", new Importer(a, b))
			} else {
				a.data("importer", new ImporterDegrade(a, b))
			}
		}
		a.data("importer").show();
		var c = a.find(".ga-importer-share-panel");
		if ((c.length > 0) && !c.data("importerShare")) {
			c.data("importerShare", new ImporterShare(c, a))
		}
	} else {
		hideImporter()
	}
}

function hideImporter() {
	show_importer = false;
	$(".ga-importer").data("importer").hide();
	ajust_studio()
}

class Importer {
	constructor(a, b) {
		this.$el = a;
		this.$list = this.$el.find(".ga-importer-files");
		this.$queue = this.$el.find(".ga-importer-queue");
		this.importedCount = 0;
		this.isShareMode = false;
		this.studio = b;
		this.initialize()
	};
	initialize() {
		var a = this;
		this.$el.find(".ga-importer-results").hide();
		$(document).on("dragover", function (c) {
			c.dataTransfer = c.originalEvent && c.originalEvent.dataTransfer;
			var b = c.dataTransfer;
			c.preventDefault();
			c.stopPropagation();
			b.dropEffect = "none"
		});
		this.$el.on("dragenter", function (b) {
			b.preventDefault();
			b.stopPropagation();
			if (a.shareMode()) {
				return
			}
			a.$el.find(".ga-import-dnd-hint").addClass("dragover")
		}).on("dragover", function (c) {
			c.dataTransfer = c.originalEvent && c.originalEvent.dataTransfer;
			var b = c.dataTransfer;
			c.preventDefault();
			c.stopPropagation();
			if (a.shareMode()) {
				return
			}
			b.dropEffect = "copy"
		}).on("dragleave", function (b) {
			b.preventDefault();
			b.stopPropagation();
			if (a.shareMode()) {
				return
			}
			if ($(b.target).hasClass("ga-import-dnd-hint")) {
				a.$el.find(".ga-import-dnd-hint").removeClass("dragover")
			}
		}).on("drop", function (b) {
			b.dataTransfer = b.originalEvent && b.originalEvent.dataTransfer;
			b.preventDefault();
			if (a.shareMode()) {
				return
			}
			a.addFiles(b.dataTransfer.files);
			a.$el.find(".ga-import-dnd-hint").removeClass("dragover")
		}).on("videoReady fontReady", function () {
			a.updateResults()
		}).on("uploadReady uploadCanceled", function () {
			a.checkList()
		}).on("clearFile", function () {
			a.updateResults()
		}).on("quit", ".ga-importer-share-panel", function () {
			a.shareMode(false)
		}).on("click", ".ga-importer-notice a.open-your-library", function (b) {
			b.preventDefault();
			a.studio.openYourLibrary()
		});
		this.$el.find(".ga-importer-file-input").on("change", function () {
			a.addFiles(this.files)
		});
		this.$el.find(".ga-importer-notice-clear").click(function (b) {
			b.preventDefault();
			a.clearList()
		});
		this.$el.find(".ga-importer-share").click(function (b) {
			b.preventDefault();
			a.shareMode(true)
		}).tooltip();
		this.$el.find(".hints > .glyph-circle-question_mark").hover(function () {
			$(this).next(".tooltip").fadeIn()
		}, function () {
			$(this).next(".tooltip").fadeOut()
		});
		if (this.studio) {
			this.studio.bind("userAssetReady", $.proxy(this.onAssetReady, this)).bind("userAssetDelete", $.proxy(this.onAssetDelete, this)).bind("imageFrameSelect", $.proxy(this.onImageFrameSelect, this)).bind("imageFrameDeselect", $.proxy(this.onImageFrameDeselect, this))
		}
	};
	show() {
		this.$el.addClass("show")
	};
	hide() {
		this.$el.removeClass("show")
	};
	clearList() {
		this.$list.find(".imported, .canceled, .invalid").remove();
		this.updateResults()
	};
	updateResults() {
		this.importedCount = this.$list.children(".imported").length;
		var a = this.$list.children(".processing").length,
			b = this.$list.children(":not(.cleared)").length,
			d = this.$queue.children(":not(.canceled)").length,
			c = this.$queue.children(".waiting").length;
		this.$el.find(".ga-importer-start").toggle(b == 0 && d == 0);
		this.$el.find(".ga-importer-results").toggle(b > 0);
		this.$el.find(".ga-importer-queue-message").toggle(c > 0);
		if (this.importedCount == 0) {
			$(".ga-importer-notice-count").hide();
			if (this.studio && d == 0 && a == 0) {
				this.studio.importerStatus("clear")
			}
		} else {
			$(".ga-importer-notice-count").show();
			if (this.studio && (d == c) && a == 0) {
				this.studio.importerStatus("done")
			}
		}
	};
	checkList() {
		var c = !!this.$queue.find(".uploading").length;
		var b = this.$queue.find(".pending");
		if (!c && b.length > 0) {
			var a = b.first().data("importerFile");
			if (a.isValid()) {
				this.uploadFile(a)
			} else {
				a.$el.appendTo(this.$list);
				this.checkList();
				return
			}
		}
		this.updateResults()
	};
	addFiles(a) {
		if (a.length == 0) {
			return
		}
		this.$el.find(".ga-importer-start").hide();
		this.$queue.show();
		var b = this;
		$.each(a, function (c, d) {
			var f = b.render();
			var e = new ImporterFile(d, f);
			e.setFilename(d.name);
			f.data("importerFile", e);
			b.$queue.append(f);
			setTimeout(function () {
				f.addClass("in")
			}, 100)
		});
		this.$el.find(".ga-importer-base-form").get(0).reset();
		this.checkList()
	};
	render() {
		var a = $("#importer-file-tmpl").tmpl();
		return $(a)
	};
	uploadFile(c) {
		var a = this;
		if (this.studio) {
			this.studio.importerStatus("processing")
		}
		c.status("uploading");
		var b = new FormData();
		b.append("file", c.file);
		b.append("subtype", c.subtype);
		c.xhr = $.ajax({
			type: "POST",
			url: "/ajax/saveUserProp",
			data: b,
			xhr: function () {
				_xhr = $.ajaxSettings.xhr();
				if (_xhr.upload) {
					_xhr.upload.addEventListener("progress", $.proxy(c.onProgress, c), false)
				}
				return _xhr
			},
			success: function (d) {
				a.fileUploaded(c, d)
			},
			processData: false,
			contentType: false,
			dataType: "json"
		}).always(function () {
			a.checkList()
		})
	};
	fileUploaded(b, a) {
		if (a.suc) {
			b.asset.id = a.id;
			b.asset.encrypt_id = a.encrypt_id;
			b.asset.type = a.asset_type;
			if (a.filename) {
				b.setFilename(a.filename)
			}
			if (a.asset_data) {
				b.asset.data = a.asset_data;
				if (b.asset.data.file) {
					b.$el.data("fileId", b.asset.data.file)
				}
			}
			if (a.asset_type == "video") {
				b.status("processing");
				b.$el.appendTo(this.$list);
				b.setIcon("loading");
				if (this.studio) {
					b.studio = this.studio
				}
				setTimeout(function () {
					b.checkVideoStatus()
				}, b.options.video_status_interval)
			} else {
				if (a.asset_type == "font") {
					b.status("processing");
					b.$el.appendTo(this.$list);
					b.setIcon("loading");
					if (this.studio) {
						b.studio = this.studio
					}
					setTimeout(function () {
						b.checkFontStatus()
					}, b.options.font_status_interval)
				} else {
					b.status("imported");
					b.$el.appendTo(this.$list);
					if (a.thumbnail) {
						b.asset.thumbnail = a.thumbnail;
						b.setIcon(a.thumbnail)
					} else {
						b.setIcon(a.asset_type)
					}
					if (this.studio) {
						b.studio = this.studio;
						this.studio.importerUploadComplete(b.asset)
					}
				}
			}
		} else {
			b.status("invalid");
			b.setIcon("invalid");
			b.$el.find(".error").text(a.msg);
			b.$el.appendTo(this.$list)
		}
	};
	findImportedByFileId(b) {
		var a = false;
		this.$list.find(".imported").each(function () {
			if ($(this).data("fileId") == b) {
				a = $(this)
			}
		});
		return a
	};
	onAssetReady(b, a) {
		var c = this.findImportedByFileId(a.file);
		if (c) {
			c.data("importerFile").setReady()
		}
	};
	onAssetDelete(c, b) {
		var f = this.findImportedByFileId(b.file);
		if (f) {
			var d = f.data("importerFile");
			d.setDeleted();
			var a = this.$el.find(".ga-importer-share-panel");
			if (a.length > 0) {
				a.data("importerShare").deleteAsset(d.asset.encrypt_id)
			}
		}
	};
	onImageFrameSelect() {
		this.$el.addClass("is-for-image-frame")
	};
	onImageFrameDeselect() {
		this.$el.removeClass("is-for-image-frame")
	};
	shareMode(a) {
		if (a === undefined) {
			return this.isShareMode
		}
		this.isShareMode = !!a;
		this.$el.find(".ga-importer-file-input").prop("disabled", this.isShareMode);
		this.$el.find(".importer-button").toggleClass("disabled", this.isShareMode);
		this.$el.find(".ga-importer-content").toggle(!this.isShareMode);
		var b = this.$el.find(".ga-importer-share-panel");
		b.toggle(this.isShareMode);
		if (this.isShareMode && (b.length > 0)) {
			b.data("importerShare").addAssets(this.getImportedAssets())
		}
	};
	getImportedAssets() {
		var b = this.$list.children(".imported.ready");
		var a = [],
			c;
		$.each(b, function () {
			c = $(this).data("importerFile");
			a.push(c.getData())
		});
		return a
	};
}

var ImporterFile = function (c, a, b) {
	this.options = $.extend({}, ImporterFile.defaults.options, b);
	this.file = c;
	this.$el = a;
	this._status = "";
	this.asset = {
		id: 0,
		encrypt_id: "",
		type: "",
		thumbnail: "",
		data: {}
	};
	this.studio = undefined;
	this.subtype = "";
	this.initialize()
};
ImporterFile.prototype.initialize = function () {
	var b = this;
	var a = this.guessType();
	if (a == "image") {
		this.setIcon("image");
		this.setMenu("prop");
		this.status("waiting")
	} else {
		if (a == "flash") {
			this.setIcon("flash");
			this.setMenu("prop");
			this.status("waiting")
		} else {
			if (a == "audio") {
				this.setIcon("sound");
				this.setMenu("sound");
				this.status("waiting")
			} else {
				this.status("pending");
				if (a == "font") {
					this.$el.find(".category").text(GT.gettext("Font"))
				} else {
					if (a == "video") {
						this.$el.find(".category").text(GT.gettext("Video"))
					}
				}
			}
		}
	}
	this.$el.on("click", '[data-action="add-to-scene"], [data-action="add-to-frame"]', function (c) {
		c.preventDefault();
		b.addToScene()
	}).on("click", '[data-action="cancel-upload"]', function (c) {
		c.preventDefault();
		b.cancelUpload()
	}).on("click", "[data-subtype]", function (c) {
		c.preventDefault();
		b.subtype = $(this).data("subtype");
		b.status("pending");
		b.setIcon("");
		b.$el.find(".category").text($(this).text());
		b.$el.trigger("uploadReady")
	}).on("click", '[data-action="clear-file"]', function (c) {
		c.preventDefault();
		b.clearFile()
	})
};
ImporterFile.prototype.status = function (a) {
	if (a === undefined) {
		return this._status
	}
	this.$el.removeClass(this._status);
	this._status = a;
	this.$el.addClass(this._status).trigger(this._status);
	if (this._status == "processing") {
		this.$el.find(".processing > .processing-" + this.asset.type).show()
	}
};
ImporterFile.prototype.setReady = function () {
	this.$el.addClass("ready");
	if ((this.guessType() === "image") && (this.subtype === "prop")) {
		this.$el.addClass("image-prop")
	}
};
ImporterFile.prototype.setDeleted = function () {
	this.$el.removeClass("ready").addClass("deleted");
	this.$el.find(".error").text(GT.gettext("This asset has been deleted"))
};
ImporterFile.prototype.fileTypeCheck = function () {
	var a = (this.file.type == "") ? FileMIME.guess(this.file.name) : this.file.type;
	if ($.inArray(a, this.options.restricted_mime) >= 0) {
		throw "Your current plan does not support this file type"
	}
	if ($.inArray(a, this.options.accept_mime) < 0) {
		throw "Invalid file type"
	}
};
ImporterFile.prototype.fileSizeCheck = function () {
	if (this.file.size > this.options.accept_filesize) {
		throw "Exceeds file size limit (Max:15MB)"
	}
};
ImporterFile.prototype.guessType = function () {
	if (!this.file) {
		return ""
	}
	var b = this.file.type;
	if (b == "application/x-shockwave-flash") {
		return "flash"
	} else {
		if (b == "") {
			b = FileMIME.guess(this.file.name)
		}
	}
	var a = b.split("/");
	return a[0]
};
ImporterFile.prototype.isValid = function () {
	try {
		this.fileTypeCheck();
		this.fileSizeCheck();
		return true
	} catch (a) {
		this.status("invalid");
		this.setIcon("invalid");
		this.$el.find(".error").text(a);
		return false
	}
};
ImporterFile.prototype.onProgress = function (b) {
	if (b.lengthComputable) {
		var a = Math.floor(b.loaded / b.total * 100);
		this.$el.find(".upload-progress").css("width", a + "%")
	}
};
ImporterFile.prototype.setFilename = function (a) {
	this.$el.find(".filename").text(a)
};
ImporterFile.prototype.setIcon = function (d) {
	var a = this.$el.find(".ga-importer-file-icon");
	var c = ["prop", "image", "flash", "bg", "sound", "video", "font", "invalid", "loading"];
	a.removeClass(c.join(" "));
	if (!d) {
		return
	}
	if ($.inArray(d, c) >= 0) {
		a.addClass(d);
		return
	}
	var b = $("<img>").attr("src", d);
	a.html(b)
};
ImporterFile.prototype.setMenu = function (b) {
	var a = $("#importer-select-" + b + "-tmpl").tmpl({});
	this.$el.find(".menu").html(a)
};
ImporterFile.prototype.addToScene = function () {
	if (this._status != "imported") {
		return false
	}
	if (this.studio) {
		this.studio.importerAddAsset(this.asset.type, this.asset.data.file)
	}
};
ImporterFile.prototype.cancelUpload = function () {
	if (this._status == "imported") {
		return false
	}
	if (typeof this.xhr !== "undefined") {
		this.xhr.abort()
	}
	this.status("canceled");
	this.$el.find(".upload-progress").css("width", 0);
	this.$el.fadeOut(400, function () {
		$(this).trigger("uploadCanceled").remove()
	})
};
ImporterFile.prototype.checkVideoStatus = function () {
	var a = this;
	$.post("/ajax/getAssetVideoStatus/" + this.asset.id, function (b) {
		if (b.suc) {
			if (b.status == "completed") {
				a.asset.data = b.asset_data;
				if (b.thumbnail) {
					a.asset.data.thumbnail = b.thumbnail
				}
				a.$el.data("fileId", a.asset.data.file);
				a.status("imported");
				a.setIcon("video");
				if (a.studio) {
					a.studio.importerUploadComplete(a.asset)
				}
				a.$el.trigger("videoReady")
			} else {
				setTimeout(function () {
					a.checkVideoStatus()
				}, a.options.video_status_interval)
			}
		} else {
			a.status("invalid");
			a.setIcon("invalid");
			a.$el.find(".error").text(b.msg)
		}
	}, "json")
};
ImporterFile.prototype.checkFontStatus = function () {
	var a = this;
	$.post("/ajax/getAssetFontStatus/" + this.asset.id, function (b) {
		if (b.suc) {
			if (b.status == "completed") {
				a.asset.data = b.asset_data;
				if (b.thumbnail) {
					a.asset.data.thumbnail = b.thumbnail
				}
				a.$el.data("fileId", a.asset.data.file);
				a.status("imported");
				a.setIcon("font");
				if (a.studio) {
					a.studio.importerUploadComplete(a.asset)
				}
				a.$el.trigger("fontReady")
			} else {
				setTimeout(function () {
					a.checkFontStatus()
				}, a.options.font_status_interval)
			}
		} else {
			a.status("invalid");
			a.setIcon("invalid");
			a.$el.find(".error").text(b.msg)
		}
	}, "json")
};
ImporterFile.prototype.clearFile = function () {
	if (this._status == "imported" || this._status == "invalid") {
		this.$el.addClass("cleared").fadeOut(400, function () {
			$(this).trigger("clearFile").remove()
		})
	}
};
ImporterFile.prototype.getData = function () {
	var a = {
		file: this.file,
		asset: this.asset
	};
	a.category = this.$el.find(".category").text();
	return a
};
ImporterFile.defaults = {};
ImporterFile.defaults.options = {
	accept_mime: ["image/png", "image/jpeg", "image/gif", "image/bmp", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/vnd.wave", "audio/wave", "audio/mp3", "audio/mp4", "audio/ogg", "audio/vorbis", "audio/aac", "audio/m4a", "audio/x-m4a", "application/x-shockwave-flash", "application/mp4", "video/mp4", "video/mpeg4", "video/x-flv", "video/x-ms-wmv"],
	restricted_mime: [],
	accept_filesize: 15728640,
	video_status_interval: 30000,
	font_status_interval: 30000
};
var ImporterDegrade = function (a, b) {
	this.$el = a;
	this.$list = this.$el.find(".ga-importer-files");
	this.$queue = this.$el.find(".ga-importer-queue");
	this.$base_form = this.$el.find(".ga-importer-base-form");
	this.importedCount = 0;
	this.iframe_count = 0;
	this.studio = b;
	this.initialize()
};
ImporterDegrade.prototype = $.extend({}, Importer.prototype, {
	initialize: function () {
		var a = this;
		this.$el.find(".ga-importer-results, .ga-importer-start-draghere").hide();
		this.$el.on("videoReady fontReady", function () {
			a.updateResults()
		}).on("uploadCanceled", function () {
			a.$el.find(".file-trigger").prop("disabled", false);
			a.$el.find(".ga-importer-file-input").prop("readonly", false);
			a.$base_form[0].reset();
			a.updateResults()
		}).on("uploadReady", function (b) {
			var c = $(b.target).data("importerFile");
			a.uploadFile(c)
		}).on("clearFile", function () {
			a.updateResults()
		}).on("quit", ".ga-importer-share-panel", function () {
			a.shareMode(false)
		}).on("click", ".ga-importer-notice a.open-your-library", function (b) {
			b.preventDefault();
			a.studio.openYourLibrary()
		});
		this.$el.find(".file-trigger").text("Select File");
		this.$el.find(".ga-importer-file-input").on("change", function () {
			if ($(this).val()) {
				var b = a.createFile($(this).val());
				a.addFile(b)
			}
		}).prop("multiple", false);
		this.$el.find(".ga-importer-notice-clear").click(function (b) {
			b.preventDefault();
			a.clearList()
		});
		this.$el.find(".ga-importer-share").click(function (b) {
			b.preventDefault();
			a.shareMode(true)
		}).tooltip();
		this.$el.find(".hints > .glyph-circle-question_mark").hover(function () {
			$(this).next(".tooltip").fadeIn()
		}, function () {
			$(this).next(".tooltip").fadeOut()
		});
		if (this.studio) {
			this.studio.bind("userAssetReady", $.proxy(this.onAssetReady, this)).bind("userAssetDelete", $.proxy(this.onAssetDelete, this)).bind("imageFrameSelect", $.proxy(this.onImageFrameSelect, this)).bind("imageFrameDeselect", $.proxy(this.onImageFrameDeselect, this))
		}
	},
	createFile: function (c) {
		var b = {};
		var a = c.split(/(\\|\/)/g).pop();
		b.name = a;
		b.type = FileMIME.guess(a);
		return b
	},
	addFile: function (a) {
		this.$el.find(".ga-importer-start").hide();
		this.$queue.show();
		var c = this.render();
		var b = new ImporterFile(a, c);
		c.data("importerFile", b);
		b.setFilename(a.name);
		if (b._status == "waiting") {
			this.$el.find(".file-trigger").prop("disabled", true);
			this.$el.find(".ga-importer-file-input").prop("readonly", true)
		} else {
			this.uploadFile(b)
		}
		this.$queue.append(c);
		setTimeout(function () {
			c.addClass("in")
		}, 100);
		this.updateResults()
	},
	uploadFile: function (d) {
		if ("undefined" == typeof this.iframe_count) {
			this.iframe_count = 0
		}++this.iframe_count;
		d.setIcon("loading");
		d.status("processing");
		var c = this,
			a = this.$base_form,
			b = $('<iframe name="if_zone_' + this.iframe_count + '" style="display:none"></iframe>');
		if (1 == a.attr("loading")) {
			return
		}
		a.attr("loading", 1);
		a.attr("id", "if_" + this.iframe_count);
		a.attr("enctype", "multipart/form-data");
		a.attr("method", "POST");
		a.attr("target", "if_zone_" + this.iframe_count);
		a.find('input[name="subtype"]').val(d.subtype);
		$("body").append(b);
		a.submit();
		if (this.studio) {
			this.studio.importerStatus("processing")
		}
		b.load(function () {
			var e = b.contents().find("body").html();
			e = $.parseJSON(e);
			b.remove();
			a.attr("loading", 0);
			c.$base_form[0].reset();
			c.fileUploaded(d, e);
			c.updateResults();
			c.$el.find(".file-trigger").prop("disabled", false);
			c.$el.find(".ga-importer-file-input").prop("readonly", false)
		})
	}
});