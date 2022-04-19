var previewPlayerTempData = "";

function newAnimation() {
	window.location = "/studio"
}

function savePreviewData(a) {
	previewPlayerTempData = a
}

function retrievePreviewPlayerData() {
	var a = previewPlayerTempData;
	previewPlayerTempData = "";
	return a
}
var sceneNum;

function getSceneNum(a) {
	sceneNum = a
}

function scenePreview() {
	document.getElementById("Player").onExternalPreviewScenePreview(sceneNum)
}

function callSceneNum() {
	document.getElementById("Player").onExternalPreviewCallSceneNum(sceneNum)
}
var STUDIO_MIN_WIDTH = 960;
var STUDIO_MIN_HEIGHT = 640;
var resize_studio = true;
var show_cc_ad = false;
var show_voice_ad = false;
var show_worknote = false;
var worknote_expand = false;
var show_importer = false;

function ajust_studio() {
	if (!resize_studio) {
		return
	}
	var b = 0;
	b += (show_cc_ad ? 135 : 0);
	b += (show_voice_ad ? 130 : 0);
	b += (show_worknote ? (worknote_expand ? 340 : 30) : 0);
	b += (show_importer ? 260 : 0);
	var e = Math.max(jQuery(window).width(), STUDIO_MIN_WIDTH + b);
	jQuery("#studio_container").width(e);
	jQuery("#studio_holder").width(e - b).toggleClass("offset", show_importer);
	var a = jQuery(window).height() - (jQuery("div.header").length > 0 ? 80 : 0);
	a = Math.max(a, STUDIO_MIN_HEIGHT);
	jQuery("#studio_container").height(a);
	if (jQuery("#studio_container .studio-worknote .worknotes-container").length > 0) {
		var d = jQuery(document).height() - jQuery("#studio_container .studio-worknote .worknote-top-nav").outerHeight();
		jQuery("#studio_container .studio-worknote.expand .worknotes-module").height(d);
		d -= jQuery("#studio_container .studio-worknote .worknotes-module .worknotes-module-top").outerHeight();
		jQuery("#studio_container .studio-worknote.expand .worknotes-module .worknotes-container").height(d)
	}
	if (jQuery("#studio_container .ga-importer").length > 0) {
		var c = jQuery(".ga-importer").outerHeight() - jQuery(".ga-importer-header").outerHeight();
		jQuery(".ga-importer-content, .ga-importer-share-panel").height(c)
	}
	jQuery(window).trigger("studio_resized")
}

function previewSceen() {
	if (!resize_studio) {
		return false
	}
	resize_studio = false;
	jQuery("#studio_container").width(1).height(1);
	jQuery("body").removeClass("full_screen_studio").addClass("preview_player")
}

function restoreStudio() {
	resize_studio = true;
	jQuery("body").removeClass("preview_player").addClass("full_screen_studio");
	ajust_studio()
}

function showCCBrowser(b) {
	var a = b || "cc2";
	previewSceen();
	jQuery(".ccbrowsercontainer").data("theme-id", a);
	(jQuery(".sidepanel #btnCreate").attr("href", "javascript:createNewChar('" + a + "')"))[(["anime", "ninjaanime", "spacecitizen"].indexOf(a) >= 0) ? "hide" : "show"]();
	(jQuery("div.ccbrowsercontainer div.cccopy"))[a == "spacecitizen" ? "hide" : "show"]();
	(jQuery("div.categoryselector"))[a == "cc2" ? "show" : "hide"]();
	jQuery("body").addClass("ccbrowser");
	jQuery("#ccbrowserdiv").css("visibility", "visible");
	dataLayer.push({
		event: "ga-pageview-t1",
		path: "/pageTracker/ccbrowser/open"
	});
	Gallery.setThemeId(a);
	Gallery.fetchModel("*");
	return false
}

function hideCCBrowser() {
	jQuery("body").removeClass("ccbrowser");
	jQuery("#ccbrowserdiv").css("visibility", "hidden");
	jQuery("#tileContainer div.pageContainer").remove();
	dataLayer.push({
		event: "ga-pageview-t1",
		path: "/pageTracker/ccbrowser/close"
	});
	restoreStudio();
	return false
}

function gaClientTrack() {
	var a = ["_trackEvent"];
	for (i = 0; i < arguments.length; i++) {
		a.push(arguments[i])
	}
	_gaq.push(a)
}
var VideoTutorial = function (a) {
	this.$el = a;
	this.wistiaEmbed = null;
	this.initialize()
};
VideoTutorial.prototype = {
	initialize: function () {
		var a = this;
		this.$el.find(".tutorial-button, .close_btn").click(function (b) {
			b.preventDefault();
			a.hide()
		})
	},
	launch: function (a) {
		if (!VideoTutorial.tutorials[a]) {
			return
		}
		var b = VideoTutorial.tutorials[a];
		this.show();
		this.$el.find("h2").text(b.title);
		this.wistiaEmbed = Wistia.embed(b.wistiaId, {
			autoPlay: true,
			container: "wistia_player"
		})
	},
	show: function () {
		previewSceen();
		this.$el.show()
	},
	hide: function () {
		if (typeof this.wistiaEmbed == "object") {
			this.wistiaEmbed.remove();
			this.wistiaEmbed = null
		}
		this.$el.hide();
		restoreStudio()
	}
};
VideoTutorial.tutorials = {};
var interactiveTutorial = {
	isShowTutorial: false,
	neverDisplay: function (a) {
		if (a === undefined) {
			return !this.needToShow()
		}
		if (a) {
			jQuery.ajax({
				type: "POST",
				url: "/ajax/tutorialStatus/skipped"
			})
		}
	},
	needToShow: function () {
		return this.isShowTutorial
	}
};
var studioApi = function (d) {
	var c;

	function a() {
		c = "go" + ("" + Math.random()).slice(3, 15);
		$[c] = function (g, f) {
			var h = $.Event(g);
			setTimeout(function () {
				d.trigger(h, f)
			}, 1)
		};
		b.bind("ready", function () {
			b.ready = true
		}).bind("showSideBar", function (g, f) {
			if (f.visible) {
				showWorknoteWidget()
			} else {
				hideWorknoteWidget()
			}
		}).bind("stageLock", function () {
			$("body").addClass("studio-locked")
		}).bind("stageUnlock", function () {
			$("body").removeClass("studio-locked")
		})
	}
	var e = d.data("studioApi");
	var b = e || {
		ready: false,
		bind: function (g, f) {
			d.bind(g, f);
			return b
		},
		one: function (g, f) {
			d.one(g, f);
			return b
		},
		unbind: function (g, f) {
			d.unbind(g, f);
			return b
		},
		trigger: function (g, f) {
			d.trigger(g, [b, f]);
			return b
		},
		bindStudioEvents: function () {
			var f = "jQuery." + c,
				g = b.getStudio();
			g.bind("ready", f);
			g.bind("scene", f);
			g.bind("sceneDuration", f);
			g.bind("sceneAdd", f);
			g.bind("sceneRemove", f);
			g.bind("save", f);
			g.bind("reorder", f);
			g.bind("showSideBar", f);
			g.bind("stageLock", f);
			g.bind("stageUnlock", f);
			g.bind("userAssetReady", f);
			g.bind("userAssetDelete", f);
			g.bind("imageFrameSelect", f);
			g.bind("imageFrameDeselect", f);
			return b
		},
		unbindStudioEvents: function () {
			var f = "jQuery." + c,
				g = b.getStudio();
			g.unbind("ready", f);
			g.unbind("scene", f);
			g.unbind("sceneDuration", f);
			g.unbind("sceneAdd", f);
			g.unbind("sceneRemove", f);
			g.unbind("save", f);
			g.unbind("reorder", f);
			g.unbind("showSideBar", f);
			g.unbind("stageLock", f);
			g.unbind("stageUnlock", f);
			g.unbind("userAssetReady", f);
			g.unbind("userAssetDelete", f);
			g.unbind("imageFrameSelect", f);
			g.unbind("imageFrameDeselect", f);
			return b
		},
		getStudio: function () {
			return $("object", d)[0]
		},
		getSceneGuid: function () {
			return b.getStudio().getSceneGuid()
		},
		getScenesInfo: function () {
			return b.getStudio().getSceneInfoArray()
		},
		selectScene: function (f) {
			b.getStudio().selectSceneByGuid(f);
			return b
		},
		setWorkNoteMenuItemSelected: function (f) {
			b.getStudio().setWorkNoteMenuItemSelected(f);
			return b
		},
		importerStatus: function (f) {
			b.getStudio().importerStatus(f);
			return b
		},
		importerUploadComplete: function (g) {
			var h = null,
				f = null;
			if (g.data.file.lastIndexOf(".") >= 0) {
				h = g.data.file.substring(g.data.file.lastIndexOf(".") + 1).toLowerCase()
			} else {
				h = g.data.file
			}
			b.getStudio().importerUploadComplete(g.type, g.id, g.data);
			if (g.type === "sound") {
				f = g.data.subtype
			} else {
				f = g.type
			}
			amplitudeTrackEvent(AMPLITUDE_EVENT.UPLOAD_ASSET, {
				type: f,
				file_format: h
			});
			return b
		},
		importerAddAsset: function (g, f) {
			b.getStudio().importerAddAsset(g, f);
			return b
		},
		openYourLibrary: function () {
			b.getStudio().openYourLibrary();
			return b
		}
	};
	if (!d.data("studioApi")) {
		a()
	}
	d.data("studioApi", b);
	return b
};
var worknoteApi = {
	addNote: function (b) {
		var a = $.post("/ajax/addWorknote", b, null, "json");
		return a
	},
	addNoteWOL: function (b) {
		var a = $.post("/ajax/addWorknoteWOL", b, null, "json");
		return a
	},
	addReply: function (b) {
		var a = $.post("/ajax/", b, null, "json");
		return a
	},
	removeNote: function (b) {
		var a = $.post("/ajax/deleteWorknote", b, null, "json");
		return a
	},
	removeNoteWOL: function (b) {
		var a = $.post("/ajax/deleteWorknoteWOL", b, null, "json");
		return a
	},
	resolveNote: function (b) {
		var a = $.post("/ajax/resolveWorknote", b, null, "json");
		return a
	}
};
var StudioWorknoteModule = function (a) {
	this.$el = $("#studio_container .studio-worknote-container");
	this.movieId = a;
	this.studio = studioApi($("#studio_holder"));
	this.scenes = [];
	this.csrfToken = $('input[name="ct"]').val();
	this.movieSaved = !!a;
	this.initialize()
};
StudioWorknoteModule.prototype = {
	initialize: function () {
		var a = this;
		if (this.studio.ready) {
			var b = this.studio.getScenesInfo();
			this.scenes = b || this.scenes
		}
		this.studio.bind("scene", function (f, d) {
			var c = d.guid;
			a.highlightScene(c)
		}).bind("sceneDuration", function (c) {
			var d = a.studio.getScenesInfo();
			a.scenes = d || a.scenes;
			a.processScenesInfo()
		}).bind("reorder sceneAdd sceneRemove", function (d, c) {
			var f = a.studio.getScenesInfo();
			a.scenes = f || a.scenes;
			if (d.type == "reorder") {
				a.reorderScenes()
			} else {
				if (d.type == "sceneAdd") {
					a.sceneAdded(c.guid)
				} else {
					if (d.type == "sceneRemove") {
						a.sceneRemoved(c.guid)
					}
				}
			}
		}).bind("save", function (d, c) {
			if (c.movieId) {
				a.handleMovieSave(c.movieId)
			}
		});
		this.$el.on("click", ".scene-note-header", function (d) {
			d.preventDefault();
			var c = $(this).closest(".scene-note");
			a.selectScene(c)
		}).on("click", '[data-action="note-reply"]', function (d) {
			d.preventDefault();
			var c = $(this).closest(".scene-note").data("scene-id");
			var f = $(this).closest(".worknote").data("note-id");
			a.showReply(c, f)
		}).on("click", '[data-action="note-reply-dismiss"]', function () {
			a.hideReply()
		}).on("click", '[data-action="note-resolve"]', function (f) {
			f.preventDefault();
			var c = ($(this).data("status") == "new") ? 0 : 1;
			var d = {
				mid: a.movieId,
				noteId: $(this).closest(".worknote").data("note-id"),
				reopen: c,
				ct: a.csrfToken
			};
			a.resolveNote(d)
		}).on("click", '[data-action="note-delete"]', function (d) {
			d.preventDefault();
			if (!confirm(GT.gettext("Are you sure you have to delete this note?"))) {
				return
			}
			var c = {
				mid: a.movieId,
				noteId: $(this).closest(".worknote").data("note-id"),
				ct: a.csrfToken
			};
			a.removeNote(c)
		}).on("click", '[data-action="show-add-note"]', function (c) {
			c.preventDefault();
			$("#worknotes-module").toggleClass("show-form", true)
		}).on("submit", ".worknote-post-form, .worknote-reply-form", function (f) {
			f.preventDefault();
			var c = $(this);
			var d = $(this).serializeArray();
			d.push({
				name: "mid",
				value: a.movieId
			});
			if (c.hasClass("worknote-post-form")) {
				a.addNote($.param(d))
			} else {
				a.addReply($.param(d))
			}
		})
	},
	load: function () {
		var c = this,
			b = "/ajax/getWorknotesPanel/" + this.movieId + "/studio",
			a = this.$el.find(".content");
		if (a.find(".worknotes-module").length) {
			return
		}
		if (!this.movieSaved) {
			a.empty().html("Please save your video first before adding notes.");
			return
		}
		a.empty().addClass("loading");
		$.post(b, function (e) {
			a.removeClass("loading").html(e);
			if (c.studio.ready) {
				var d = c.studio.getSceneGuid();
				if (d != "") {
					c.highlightScene(d)
				}
				var g = c.studio.getScenesInfo();
				c.scenes = g || c.scenes
			}
			c.processScenesInfo();
			if (jQuery("#studio_container .studio-worknote .worknotes-container").length > 0) {
				var f = jQuery(document).height() - jQuery("#studio_container .studio-worknote .worknote-top-nav").outerHeight();
				jQuery("#studio_container .studio-worknote.expand .worknotes-module").height(f);
				f -= jQuery("#studio_container .studio-worknote .worknotes-module .worknotes-module-top").outerHeight();
				jQuery("#studio_container .studio-worknote.expand .worknotes-module .worknotes-container").height(f)
			}
		})
	},
	showReply: function (a, f) {
		var c = this.$el.find(".worknote-reply-wrapper");
		var e = this.$el.find(".worknote-reply-form");
		var d = $("<div />").addClass("scene-note");
		var b = $("#worknote_" + f).clone().removeAttr("id");
		$("#scene-note_" + a + " .scene-note-header").clone().appendTo(d);
		d.append('<div class="worknote-separator"></div>');
		b.find(".worknote-actions").remove();
		d.append(b);
		c.find(".scene-note").remove();
		d.insertBefore(e);
		e.find('[name="scene"]').val(a).end().find('[name="pnote"]').val(f);
		c.fadeIn();
		e.find('[name="note_body"]').focus();
		$("body").on("click", $.proxy(this.hideReply, this))
	},
	hideReply: function (a) {
		if (a && $(a.target).closest(".worknotes-module").length) {
			return
		}
		this.$el.find(".worknote-reply-form").form("reset");
		this.$el.find(".worknote-reply-wrapper").fadeOut();
		$("body").off("click", $.proxy(this.hideReply, this))
	},
	processScenesInfo: function () {
		if (!this.movieSaved) {
			return
		}
		var a = this;
		$.each(this.scenes, function (b, d) {
			var c = "<b>~" + d.startFrom.toFixed(1) + 's</b> <span class="scene-num">[Scene ' + (b + 1) + "]</span>";
			$("#scene-note_" + d.guid, a.$el).find(".scene-note-header").html(c)
		})
	},
	sceneAdded: function (c) {
		if (!this.movieSaved) {
			return
		}
		$sceneNote = this.$el.find("#scene-note_" + c);
		if ($sceneNote.length) {
			$sceneNote.show()
		} else {
			var b = null;
			for (var d = 0, a = this.scenes.length; d < a; ++d) {
				if (this.scenes[d].guid != c) {
					b = this.scenes[d].guid;
					continue
				} else {
					var e = $("<div />").addClass("scene-note").attr("id", "scene-note_" + c).attr("data-scene-id", c).html('<div class="scene-active-mark"></div><div class="scene-note-header"></div><div class="scene-note-body"></div>').hide();
					$("#scene-note_" + b).after(e);
					break
				}
			}
		}
		this.processScenesInfo();
		this.highlightScene(c, false)
	},
	sceneRemoved: function (a) {
		if (!this.movieSaved) {
			return
		}
		$("#scene-note_" + a, this.$el).fadeOut();
		this.processScenesInfo()
	},
	reorderScenes: function () {
		if (!this.movieSaved) {
			return
		}
		var a = $("#worknotes-container");
		$.each(this.scenes, function (b, c) {
			$("#scene-note_" + c.guid).detach().appendTo(a)
		});
		this.processScenesInfo()
	},
	seekToScene: function (a) {
		if (this.studio.ready) {
			this.studio.seekScene(a.data("sceneId"))
		}
	},
	selectScene: function (a) {
		if (this.studio.ready) {
			this.studio.selectScene(a.data("sceneId"));
			this.highlightScene(a.data("sceneId"))
		}
	},
	highlightScene: function (a, b) {
		if (!this.movieSaved) {
			return
		}
		if (typeof (b) == "undefined") {
			b = false
		}
		var c = this.$el.find("#scene-note_" + a);
		if (c.length) {
			c.siblings().removeClass("active").end().addClass("active");
			if (this.$el.find("#scene-note_" + a + ":visible").length) {
				$("#worknotes-container").stop().scrollTo(c, 400)
			}
		}
		this.$el.find('.worknote-post-form [name="scene"]').val(a);
		this.updateNoteTime(a)
	},
	addNote: function (c) {
		var b = this;
		var a = worknoteApi.addNote(c);
		a.done(function (d) {
			if (d.suc) {
				b.$el.find("#scene-note_" + d.scene + " .scene-note-body").html(d.tmpl);
				b.$el.find(".worknote-post-form")[0].reset();
				b.$el.find("#scene-note_" + d.scene).show();
				$(".worknotes-num").text(parseInt($("#studio_container .worknotes-num").text(), 10) + 1);
				$("#worknotes-container").removeClass("empty")
			} else {
				if (d.message) {
					showNotice(d.message, true)
				}
			}
		})
	},
	removeNote: function (b) {
		var a = worknoteApi.removeNote(b);
		a.done(function (c) {
			if (c.suc) {
				var d = $("#worknote_" + b.noteId).closest(".scene-note");
				$("#worknote_" + b.noteId).prev(".worknote-separator").remove().end().remove();
				if (d.find(".worknote").length < 1) {
					d.hide()
				}
				$(".worknotes-num").text(parseInt($("#studio_container .worknotes-num").text(), 10) - 1);
				$("#worknotes-container").toggleClass("empty", $(".scene-note:visible").length == 0)
			} else {
				if (c.message) {
					showNotice(c.message, true)
				}
			}
		})
	},
	resolveNote: function (b) {
		var a = worknoteApi.resolveNote(b);
		a.done(function (c) {
			if (c.suc) {
				$("#worknote_" + b.noteId).find('.worknote-actions [data-action="note-resolve"]').data("status", c.status).find("span.note-label-" + ("resolved" == c.status ? "resolve" : "reopen")).hide().end().find("span.note-label-" + ("resolved" == c.status ? "reopen" : "resolve")).show().end().end().toggleClass("dim");
				if (b.reopen) {
					$(".worknotes-num").text(parseInt($("#studio_container .worknotes-num").text(), 10) + 1)
				} else {
					$(".worknotes-num").text(parseInt($("#studio_container .worknotes-num").text(), 10) - 1)
				}
			} else {
				if (c.message) {
					showNotice(c.message, true)
				}
			}
		})
	},
	addReply: function (c) {
		var b = this;
		var a = worknoteApi.addNote(c);
		a.done(function (d) {
			if (d.suc) {
				b.$el.find("#scene-note_" + d.scene + " .scene-note-body").html(d.tmpl);
				b.$el.find("#scene-note_" + d.scene).show();
				b.$el.find(".worknote-reply-form")[0].reset();
				b.$el.find('.worknote-reply-form [name="pnote"]').val("");
				b.hideReply()
			} else {
				if (d.message) {
					showNotice(d.message, true)
				}
			}
		})
	},
	updateNoteTime: function (c) {
		var b = "none";
		if (c) {
			for (var d = 0, a = this.scenes.length; d < a; ++d) {
				if (this.scenes[d].guid == c) {
					b = "~" + this.scenes[d].startFrom.toFixed(1) + "s";
					break
				}
			}
		}
		$("#worknotes-module .worknotes-module-top .note-timestamp").html("<b>" + b + "</b>")
	},
	handleMovieSave: function (a) {
		if (this.movieSaved) {
			return
		}
		this.movieId = a;
		this.movieSaved = true;
		this.load()
	}
};
var StudioModule = function () {
	this.studio = studioApi($("#studio_holder"));
	this.initialize()
};
StudioModule.prototype = {
	initialize: function () {
		this.studio.bind("save", function (b, a) {
			if (!a.autoSave) {
				dataLayer.push({
					event: "movie_manual_save"
				})
			}
			if (a.movieId && previewPlayer) {
				previewPlayer.setMovieId(a.movieId)
			}
		})
	}
};