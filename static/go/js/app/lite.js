if (typeof dataLayer === "undefined") {
	dataLayer = []
}

function gatrack(a) {
	dataLayer.push({
		event: "ga-pageview-t1",
		path: "/pageTracker/ajax/golite/" + golite_theme + "/" + a
	})
}

function errortrack(a) {
	if (!a.url) {
		a.url = document.location.href
	}
	jQuery.post("/ajax/errorlog", {
		error: a
	}, jQuery.noop)
}

function ItemSelector(c) {
	var b = 0,
		d = 0;
	var a;
	(function () {
		var e = null;
		a = {
			dirty: function (f) {
				if (f) {
					e = null
				}
			},
			all: function () {
				return (e ? e : (e = c.find(".item")))
			}
		}
	})();
	c.find(".item").each(function (e) {
		if (jQuery(this).hasClass("selected")) {
			b = e
		}
		d++
	});
	c.find(".select_button").click(function (g) {
		g.preventDefault();
		a.all().hide();
		if (jQuery(this).hasClass("next")) {
			if (++b == d) {
				b = 0
			}
		} else {
			if (--b == -1) {
				b = d - 1
			}
		}
		var f = a.all().eq(b);
		f.show();
		c.trigger("change", [b, f])
	});
	return {
		current: function () {
			return b
		},
		getItem: function () {
			return a.all().eq(b)
		},
		getItems: function () {
			return a.all()
		},
		gotoByOffset: function (f) {
			if (f >= 0 && f < d) {
				b = f;
				a.all().hide();
				var e = a.all().eq(b);
				e.show();
				c.trigger("change", [b, e])
			}
		},
		addItem: function () {
			a.dirty(true);
			++d
		}
	}
}
var VoiceRecorder;
if (VoiceRecorder == undefined) {
	VoiceRecorder = function (a) {
		this.init(a)
	}
}
VoiceRecorder.prototype.init = function (a) {
	try {
		this.settings = jQuery.extend({
			loadHandler: null,
			processCompleteHandler: null,
			reRecordHandler: null,
			focusHandler: null
		}, VoiceRecorder.defaultSettings, a);
		this.recorderId = "voice_recorder_" + VoiceRecorder.counter++;
		VoiceRecorder.instances[this.recorderId] = this;
		if (typeof (a.initAssetId) === "undefined") {
			this.load({})
		} else {
			this.load({
				assetId: a.initAssetId
			})
		}
	} catch (b) {
		delete VoiceRecorder.instances[this.recorderId];
		throw b
	}
};
VoiceRecorder.prototype.destory = function () {
	try {
		var a = document.getElementById(this.recorderId);
		if (a) {
			try {
				a.parentNode.removeChild(a)
			} catch (b) {}
		}
		window[this.recorderId] = null;
		VoiceRecorder.instances[this.recorderId] = null;
		delete VoiceRecorder.instances[this.recorderId];
		if (VoiceRecorder.recording == this.recorderId) {
			VoiceRecorder.recording = false
		}
		this.recorderId = null;
		this.settings = null;
		return true
	} catch (b) {
		return false
	}
};
VoiceRecorder.prototype.load = function (a) {
	if (typeof this.settings.loadHandler == "function") {
		a = jQuery.extend({}, a, {
			recorderId: this.recorderId,
			tlang: ((typeof I18N_LANG != "undefined") ? I18N_LANG : "en_US")
		});
		this.settings.loadHandler.apply(this, [a])
	}
};
VoiceRecorder.prototype.processComplete = function (a) {
	VoiceRecorder.recording = false;
	if (typeof this.settings.processCompleteHandler == "function") {
		this.settings.processCompleteHandler.apply(this, [a])
	}
};
VoiceRecorder.prototype.processError = function () {
	VoiceRecorder.recording = false
};
VoiceRecorder.prototype.reRecord = function () {
	if (typeof this.settings.reRecordHandler == "function") {
		this.settings.reRecordHandler.apply(this)
	}
};
VoiceRecorder.prototype.focus = function () {
	if (typeof this.settings.focusHandler == "function") {
		this.settings.focusHandler.apply(this)
	}
};
VoiceRecorder.prototype.showSettings = function () {
	this.setHeight(205)
};
VoiceRecorder.prototype.doneSettings = function () {
	this.setHeight(48)
};
VoiceRecorder.prototype.startRecord = function () {
	if (VoiceRecorder.recording) {
		return false
	}
	VoiceRecorder.recording = this.recorderId;
	return true
};
VoiceRecorder.prototype.setHeight = function (a) {
	if (jQuery.browser.mozilla) {
		jQuery(document.getElementById(this.recorderId).parentNode).height(a)
	} else {
		jQuery(document.getElementById(this.recorderId).parentNode).animate({
			height: a + "px"
		}, 300)
	}
};
VoiceRecorder.counter = 0;
VoiceRecorder.instances = {};
VoiceRecorder.recording = false;
VoiceRecorder.defaultSettings = {
	swf: "",
	flashvars: {
		apiserver: "https://goanimate.com/",
		appCode: "go",
		u_info: ""
	}
};
(function (a) {
	a.fn.scriptDialog = function () {
		var b = GoLite.settings.dialigMaxLength;
		return this.each(function () {
			var l = a(this);
			var o = l.find(".dialog_input");
			var c = l.find(".counter");
			var e;
			var d = new VoiceLanguageDisplay(l.find(".langarea"));
			l.bind("updatevoice", function (r, q) {
				d.updateByVoiceId(q)
			});
			l.bind("initInput", function (r, q) {
				m(q)
			});

			function j(s) {
				s.preventDefault();
				var q = GoLite.getCharacters();
				var r = parseInt(l.data("charId"), 10);
				if (q.length == 1) {
					r = 0
				} else {
					r = (r == 0) ? 1 : 0
				}
				l.find(".char_thumb > img").attr("src", q[r].data("thumb"));
				l.data("charId", r);
				if (l.data("method") == "tts") {
					l.removeData("aid")
				}
				l.trigger("updatevoice", [q[r].data("voice")]);
				l.next(".fake").trigger("switchCharacter")
			}
			if (l.hasClass("fake")) {
				l.find(".char_thumb > img").click(function (q) {
					o.focus()
				});
				o.bind("focus", function (q) {
					GoLite.insertDialog({
						charId: l.data("charId")
					});
					a(document).trigger("insert.scriptDialog");
					j(q);
					var r = a("#dialogs");
					if (r.length) {
						r.scrollTop(r[0].scrollHeight)
					}
				});
				l.bind("switchCharacter", j);
				return
			}

			function h() {
				o = null;
				c = null;
				if (e) {
					e.destory();
					e = null
				}
				l.remove();
				l = null
			}
			o.bind("keypress keyup change paste focus", function (r) {
				if (r.type == "keypress") {
					if (r.which == 13) {
						r.preventDefault();
						l.next().find(".dialog_input").focus();
						o.trigger("blur")
					}
					return
				}
				var q = b - o.val().length;
				if (q < 0) {
					o.val(o.val().substring(0, b));
					q = 0
				}
				c.html(GT.strargs(GT.gettext("%1 characters remaining"), [q]))
			});
			o.bind("focus", function (q) {
				i();
				if (l.data("method") == "tts") {
					c.show()
				}
			});
			o.bind("blur", function (q) {
				c.hide()
			});
			o.bind("change", function (q) {
				l.removeData("aid");
				GoLite.noticifyChange()
			});
			l.find(".box").click(i);
			l.find(".dialog_delete").click(function (r) {
				r.preventDefault();
				r.stopPropagation();
				if (l.siblings(":not(.fake)").length == 0) {
					return
				}
				var q = l.next(":not(.fake)");
				if (!q.length) {
					q = l.prev()
				}
				if (q.data("method") == "tts") {
					q.find(".dialog_input").focus()
				} else {
					q.siblings().removeClass("focus");
					q.addClass("focus")
				}
				h();
				a(document).trigger("delete.scriptDialog")
			});
			l.find(".dialog_insert").click(function (r) {
				r.preventDefault();
				r.stopPropagation();
				var q = {
					after: l,
					charId: l.data("charId")
				};
				if (l.data("facial")) {
					q.facial = l.data("facial")
				}
				GoLite.insertDialog(q);
				a(document).trigger("insert.scriptDialog")
			});
			l.find(".char_thumb > img, .switch, .dialog_switch").click(function (q) {
				l.siblings().removeClass("focus");
				l.addClass("focus");
				j(q);
				GoLite.noticifyChange()
			});
			l.find(".dialog_input_wrapper").inFieldLabels();
			if (l.find(".dialog_facial").length) {
				var n = l.find(".dialog_facial");
				l.bind("updateFacial", function (s, q, r) {
					if (l.data("facial") != q) {
						n.attr("class", "dialog_facial " + q).find(".value").text(r);
						l.data("facial", q);
						GoLite.noticifyChange()
					}
				});
				n.click(function (q) {
					q.preventDefault();
					facialExpression.show(l)
				})
			}
			l.data("method", "tts");
			l.find(".dialog_input_control a").click(function (t) {
				t.preventDefault();
				var s = a(this);
				if (s.data("method") == "mic" && GoLite.getUserState() == 0) {
					showNotice(GT.gettext("Please login to enable Voice Recording"));
					return
				}
				if (s.data("method") != l.data("method")) {
					var q = true;
					switch (l.data("method")) {
						case "tts":
							if (o.val().length == 0) {
								q = false
							}
							break;
						case "mic":
							if (!l.data("aid")) {
								q = false
							}
							break
					}
					if (q) {
						var r = a("#dialog_input_change_confirm").clone().find(".alert").click(function (u) {
							l.data("method", s.data("method"));
							s.siblings().removeClass("on").end().addClass("on");
							k()
						}).end();
						showOverlay(r);
						return
					}
				}
				l.data("method", s.data("method"));
				s.siblings().removeClass("on").end().addClass("on");
				k()
			});

			function k() {
				var q = o.parents(".dialog_input_wrapper");
				q.hide();
				if (q.size() <= 0) {
					o.hide()
				}
				o.val("");
				c.hide();
				if (e) {
					e.destory();
					e = null;
					l.find(".voice_recorder").hide()
				}
				l.removeData("aid");
				switch (l.data("method")) {
					case "tts":
						q.show();
						if (q.size() <= 0) {
							o.show()
						}
						o.val("").focus();
						break;
					case "mic":
						e = new VoiceRecorder({
							loadHandler: f,
							processCompleteHandler: g,
							reRecordHandler: p,
							focusHandler: i
						});
						break;
					default:
						break
				}
				GoLite.noticifyChange()
			}

			function m(q) {
				var r = o.parents(".dialog_input_wrapper");
				r.hide();
				if (r.size() <= 0) {
					o.hide()
				}
				o.val("");
				c.hide();
				if (e) {
					e.destory();
					e = null;
					l.find(".voice_recorder").hide()
				}
				switch (l.data("method")) {
					case "tts":
						r.show();
						if (r.size() <= 0) {
							o.show()
						}
						o.val("");
						break;
					case "mic":
						e = new VoiceRecorder({
							loadHandler: f,
							processCompleteHandler: g,
							reRecordHandler: p,
							focusHandler: i,
							initAssetId: q
						});
						break;
					default:
						break
				}
				GoLite.noticifyChange()
			}

			function f(q) {
				q = a.extend({}, this.settings.flashvars, q);
				l.find(".voice_recorder").show().height(48).flash({
					id: this.recorderId,
					swf: this.settings.swf,
					height: "100%",
					width: 538,
					bgcolor: "#ffffff",
					scale: "exactfit",
					allowScriptAccess: "always",
					allowFullScreen: "true",
					wmode: "transparent",
					hasVersion: "10.3",
					flashvars: q
				})
			}

			function g(q) {
				l.data("aid", q);
				GoLite.noticifyChange()
			}

			function p() {
				l.removeData("aid");
				GoLite.noticifyChange()
			}

			function i() {
				l.siblings().removeClass("focus");
				l.addClass("focus")
			}
		})
	}
})(jQuery);
var facialExpression = (function (d) {
	var b = false,
		e, c = {};
	var a = {
		init: function (f) {
			if (b) {
				return
			}
			b = true;
			d.extend(c, f);
			d("#expression_list a").click(function (h) {
				h.preventDefault();
				var g = d(this);
				if (g.hasClass("selected")) {
					return
				}
				d("#expression_list a").removeClass("selected");
				g.addClass("selected");
				d("#facial_expression_selected").val(g.data("facial"))
			});
			d("#facial_expression_submit").click(function (h) {
				h.preventDefault();
				var g = d("#expression_list a.selected");
				e.trigger("updateFacial", [g.data("facial"), g.text()]);
				e.find(".dialog_input").focus();
				d.unblockUI()
			})
		},
		initialized: function () {
			return b
		},
		name: function (f) {
			return (c[f]) ? c[f] : ""
		},
		show: function (g) {
			var f = g.data("facial") || "default";
			if (g) {
				e = g
			}
			d("#expression_list").find("a.selected").removeClass("selected").end().find("a." + f).addClass("selected");
			showOverlay(d("#facial_expression"))
		}
	};
	return a
})(jQuery);
var photoArray = [];

function updatePhotoArray() {
	try {
		photoArray = [];
		var a = document.getElementById("Player");
		if (a && typeof a.getPhotoArray == "function") {
			photoArray = a.getPhotoArray()
		}
	} catch (b) {
		gatrack("error/photoArray")
	}
}

function sendPhotoArray() {
	return photoArray
}
var GoLite = (function (e) {
	var r = 30,
		p = 10,
		b, t, a = [],
		u = null,
		o = false,
		s = false,
		v = "",
		d = false,
		c = 0,
		j = 1,
		q = false,
		i = false;
	initModeForEdit = false;

	function f() {
		var w = {};
		w.golite_theme = golite_theme;
		if (b) {
			w.enc_mid = b
		}
		w.enc_tid = t.data("tid");
		if (u) {
			w.opening_closing = u
		} else {
			w.opening_closing = {
				opening: "",
				closing: ""
			}
		}
		w.characters = [];
		e.each(a, function (z, A) {
			var y = {};
			y[A.data("cid")] = z + 1;
			w.characters.push(y)
		});
		w.script = GoLite.getScripts();
		if (i) {
			w.opening_closing.opening_characters = {};
			w.opening_closing.opening_characters.facial = e.extend({}, w.script[0].facial);
			for (x in w.opening_closing.opening_characters.facial) {
				w.opening_closing.opening_characters.facial[x] = "default"
			}
			w.opening_closing.closing_characters = {};
			w.opening_closing.closing_characters.facial = e.extend({}, w.script[(w.script.length - 1)].facial)
		}
		w.editor_mode = "new";
		if (b) {
			if (typeof goliteEditorMode != "undefined") {
				w.editor_mode = goliteEditorMode
			}
		}
		return w
	}

	function h(y, w) {
		var z = 354;
		if (w.isWide) {
			z = 310
		}
		e("#" + y).flash({
			id: "Player",
			swf: GoLite.settings.player.swf,
			height: z,
			width: 550,
			bgcolor: "#000000",
			quality: "high",
			scale: "exactfit",
			allowScriptAccess: "always",
			allowFullScreen: "true",
			wmode: "transparent",
			hasVersion: "10.3",
			flashvars: w
		})
	}

	function k(y, w) {
		w = w || {};
		e("#" + y).flash({
			id: "thumbnailChooser",
			swf: GoLite.settings.thumbnailChooser.swf,
			height: 170,
			width: 295,
			quality: "high",
			scale: "exactfit",
			allowScriptAccess: "always",
			allowFullScreen: "true",
			wmode: "transparent",
			hasVersion: "10.3",
			flashvars: w
		})
	}

	function g() {
		var z = false,
			w = false,
			y = q;
		if (c == 1 && t.data("plus")) {
			z = true;
			psHook = "golite_template.site"
		}
		if (c == 1 && (a[0].data("plus") || a[1].data("plus"))) {
			w = true;
			psHook = "golite_character.site"
		}
		q = z || w;
		e("#step1 .btn_next, #step2 .btn_next, #step3 .btn_next").toggle(!q);
		e("#step1 .upgrade, #step2 .upgrade, #step3 .upgrade").toggle(q);
		if (q != y) {
			setTimeout(function () {
				jQuery(document).trigger("GoLite.stateChange", [""])
			}, 10)
		}
	}

	function m(y, w) {
		s = true;
		v = w;
		if ("save" == w) {
			updatePhotoArray()
		}
		e("#step4 .inside > div").css("display", "none");
		if ("loading" == w) {
			e("#step4 .loading").css("display", "block")
		} else {
			if ("preview" == w) {
				e("#step4 .preview").css("display", "block");
				e("#step4 .previous_step").css("display", "block")
			} else {
				if ("save" == w) {
					e("#step4 .save").fadeIn();
					e("#step4 .previous_step").css("display", "none");
					e("#movie_title").focus();
					k("thumb_chooser_container", {
						templateThumbnail: t.data("thumb")
					})
				} else {
					if ("upgrade" == w) {
						e("#step4 .upgrade").show()
					} else {
						s = false;
						if (c == 0) {
							e("#step4 .anonymous").css("display", "block")
						} else {
							if (q) {
								e("#step4 .upgrade").css("display", "block")
							} else {
								e("#step4 .generate").css("display", "block")
							}
						}
					}
				}
			}
		}
	}

	function n() {
		var A = {
			en_US: {
				M: ["eric", "joey"],
				F: ["jennifer", "ivy"]
			},
			es_ES: {
				M: ["miguel", "miguel"],
				F: ["penelope", "penelope"]
			}
		};
		var w = "en_US";
		if (typeof A[I18N_LANG] != "undefined") {
			w = I18N_LANG
		}
		var z = {
			M: 0,
			F: 0
		};
		for (var B = 0; B < a.length; B++) {
			if (a[B].data("voice")) {
				continue
			}
			var C = a[B].data("gender");
			var y = z[C]++;
			a[B].data("voice", A[w][C][y])
		}
	}
	var l = [];
	return {
		settings: {
			dialigMaxLength: 180
		},
		init: function (D) {
			if (d) {
				return
			}
			d = true;
			c = D;
			var A = new ItemSelector(e("#templates"));
			t = A.getItem();
			e("#template_name").html(t.attr("title"));
			e("#template_desc").html(t.data("desc"));
			e("#templates").bind("change", function (H, F, G) {
				t = G;
				e("#template_name").html(G.attr("title"));
				e("#template_desc").html(G.data("desc"));
				e("#character1_title img").attr("src", G.data("char-thumb-a"));
				e("#character2_title img").attr("src", G.data("char-thumb-b"));
				g();
				e("#dialogs .dialog").removeData("sorder");
				GoLite.noticifyChange()
			});
			if (golite_theme == "talkingpicz") {
				function y(F) {
					e("#chars_" + F + " > div").each(function (G, H) {
						a[G] = e(H)
					});
					n();
					e("#dialogs .dialog").each(function (I, J) {
						var H = e(J);
						var G = parseInt(H.data("charId"), 10);
						H.find(".char_thumb > img").attr("src", a[G].data("thumb"));
						H.trigger("updatevoice", [a[G].data("voice")]);
						H.removeData("aid")
					})
				}
				e("#templates").bind("change", function (H, F, G) {
					y(G.data("tid"))
				});
				y(t.data("tid"))
			} else {
				var C = {
					findCharacterPosById: function (F) {
						var G = -1;
						this.getItems().each(function (H, I) {
							if (jQuery(I).data("cid") == F) {
								G = H
							}
						});
						return G
					}
				};
				var w = jQuery.extend(new ItemSelector(e("#character1")), C);
				var E = jQuery.extend(new ItemSelector(e("#character2")), C);
				l.push(w, E);
				var B = w.getItem();
				e("#character1").parent().find(".name").html(B.data("name"));
				a[0] = B;
				var z = E.getItem();
				e("#character2").parent().find(".name").html(z.data("name"));
				a[1] = z;
				n();
				e("#character1, #character2").bind("change", function (I, G, H) {
					e(this).parent().find(".name").html(H.data("name"));
					var F = (e(this).attr("id") == "character1") ? 0 : 1;
					a[F] = H;
					g();
					n();
					e("#dialogs .dialog").each(function (K, L) {
						var J = e(L);
						if (J.data("charId") == F) {
							J.find(".char_thumb > img").attr("src", H.data("thumb"));
							J.trigger("updatevoice", [H.data("voice")]);
							if (!initModeForEdit) {
								J.removeData("aid")
							}
						}(golite_theme == "wildlife") && J.removeData("sorder")
					});
					GoLite.noticifyChange()
				})
			}
			if (e("#facial_expression").length) {
				i = true
			}
			e(document).ready(function () {
				if (c < 2) {
					e("#templates .plus-label").before(e(".snippets .plus-cover").clone())
				}
				if (c >= 2) {
					e(".plus-character").html(e(".snippets .plus-char-txt").clone())
				}
				var F = GoLite.getCharacters();
				e("#dialogs .dialog").each(function (H, I) {
					var G = parseInt(e(this).data("charId"), 10);
					e(this).trigger("updatevoice", [F[G].data("voice")])
				});
				e("#dialogs .dialog_input_message").find(".basic").toggle(c < 2).end().find(".plus").toggle(c == 2);
				e("#dialogs .upsell, #step4 .upsell").toggle(c < 2);
				e(document).bind("delete.scriptDialog insert.scriptDialog", function (I) {
					var G = (c >= 2) ? r : p;
					var H = e("#dialogs .num");
					H.each(function (J) {
						e(this).html((J + 1))
					});
					j = H.length;
					g();
					e("#dialogs .fake").toggle(H.length < G);
					e("#dialogs .max").toggle(H.length >= G);
					GoLite.noticifyChange()
				});
				e(document).bind("GoLite.stateChange", m)
			})
		},
		getTemplate: function () {
			return t
		},
		getCharacters: function () {
			return a
		},
		getScripts: function () {
			var A = e("#dialogs .dialog:not(.fake)"),
				z = "talk",
				w = [],
				y = {};
			if (i) {
				e.each(a, function (B) {
					y[(B + 1)] = "default"
				})
			}
			A.each(function (E, M) {
				var J = e(M);
				var B = parseInt(J.data("charId"), 10);
				var I = a[B];
				if (!I) {
					return
				}
				text = e.trim(J.find(".dialog_input").val());
				var L = {
					type: z,
					cid: I.data("cid"),
					voice: I.data("voice"),
					text: text,
					char_num: B + 1
				};
				var C = J.data("aid");
				if (C) {
					L.aid = C
				} else {
					L.aid = "";
					var F = J.data("aidbkup");
					var K = J.data("textbkup");
					var H = J.data("voicebkup");
					if (typeof (F) != "undefined" && typeof (K) != "undefined" && typeof (H) != "undefined" && text.length > 0 && text == K && parseInt(F, 10) > 0 && L.voice == H) {
						L.aid = parseInt(F, 10)
					}
				}
				var G = J.data("sorder");
				if (G) {
					L.sorder = G
				} else {
					L.order = ""
				}
				if (i) {
					L.facial = {};
					var D = J.data("facial");
					if (D) {
						L.facial[B + 1] = D
					}
					L.facial = e.extend({}, y, L.facial)
				}
				w.push(L)
			});
			return w
		},
		insertDialog: function (y) {
			y = y || {};
			var z = {
				charId: 0,
				focus: true
			};
			e.extend(z, y);
			var w = (c >= 2) ? r : p;
			if (e("#dialogs .dialog:not(.fake)").length >= w) {
				return
			}
			var C = a[z.charId];
			var B = e("#dialogTmpl").tmpl({
				thumbURL: C.data("thumb"),
				hasFacial: i
			});
			B.data("charId", z.charId).scriptDialog();
			B.trigger("updatevoice", C.data("voice"));
			if (z.facial) {
				B.trigger("updateFacial", [z.facial, facialExpression.name(z.facial)])
			} else {
				if (i) {
					B.trigger("updateFacial", ["default", facialExpression.name("default")]);
					var D = e("#dialogs .fake").prev();
					while (D.length) {
						if (D.data("charId") == B.data("charId")) {
							var A = D.data("facial");
							B.trigger("updateFacial", [A, facialExpression.name(A)]);
							break
						}
						D = D.prev()
					}
				}
			}
			if (z.after) {
				B.insertAfter(z.after)
			} else {
				B.insertBefore("#dialogs .fake")
			}
			if (z.focus) {
				B.find(".dialog_input").focus()
			}
		},
		preview: function () {
			if (o || c == 0 || q || /^(preview|save)$/.test(v)) {
				return
			}
			var w = f();
			e(document).trigger("GoLite.stateChange", ["loading"]);
			e.ajaxSetup({
				error: function (y, A, z) {
					o = false;
					e(document).trigger("GoLite.stateChange", [""]);
					gatrack("error/" + A);
					errortrack({
						type: A,
						message: z,
						input: w
					})
				}
			});
			o = true;
			e.post("/ajax/previewText2Video", w, function (y) {
				o = false;
				if (y.error) {
					showNotice(y.error, true);
					e(document).trigger("GoLite.stateChange", [""]);
					gatrack("error/normal");
					return
				}
				b = y.enc_mid;
				u = y.opening_closing;
				var z = e("#dialogs .dialog:not(.fake)");
				e.each(y.script, function (C, A) {
					var B = z.eq(C);
					B.data("aid", A.aid);
					B.data("aidbkup", A.aid);
					B.data("sorder", A.sorder);
					B.data("textbkup", A.text);
					B.data("voicebkup", A.voice)
				});
				h("player_container", y.player_object);
				e(document).trigger("GoLite.stateChange", ["preview"])
			}, "json");
			e.ajaxSetup({
				error: null
			})
		},
		save: function (C) {
			if (o) {
				return
			}
			C = C || {};
			var F = {};
			e.extend(F, C);
			var E = e("#movie_title");
			var B = e.trim(E.val());
			if (B == E.attr("placeholder")) {
				B = ""
			}
			if (B.length == 0) {
				e("#movie_title").focus();
				showNotice(GT.gettext("Please enter a movie title"), true);
				return
			}
			var D = e("#movie_description");
			var A = e.trim(D.val());
			if (A == D.attr("placeholder")) {
				A = ""
			}
			var w = null;
			try {
				w = document.getElementById("thumbnailChooser").getThumbnail();
				if (w.length) {
					w = w[0]
				}
			} catch (z) {}
			var y = f();
			y.tag = "";
			y.title = B;
			y.desc = A;
			if (w) {
				y.thumbnail = w
			}
			if (F.youtubePublish) {
				y.youtube_publish = F.youtubePublish
			}
			if (F.publish_quality) {
				y.publish_quality = F.publish_quality
			}
			e.ajaxSetup({
				error: function (G, I, H) {
					o = false;
					e(document).trigger("GoLite.stateChange", [""]);
					gatrack("error/" + I);
					errortrack({
						type: I,
						message: H,
						input: y
					})
				}
			});
			o = true;
			showOverlay(e("#publishing"));
			e.post("/ajax/saveText2Video", y, function (G) {
				o = false;
				if (G.error) {
					e.unblockUI();
					showNotice(G.error, true);
					gatrack("error/normal");
					return
				}
				window.location = G.url
			}, "json");
			e.ajaxSetup({
				error: null
			})
		},
		initForEdit: function (D) {
			initModeForEdit = true;
			var J = golite_theme != "talkingpicz";
			b = D.enc_mid;
			var N = e("#templates div.item").length;
			var y = false;
			for (var O = 0; O < N; O++) {
				if (t.data("tid") == D.enc_tid) {
					y = true;
					break
				}
				e("#templates").find(".select_button.next").click()
			}
			if (y == false) {
				return false
			}
			u = D.opening_closing;
			var K, R;
			for (var C in D.characters[0]) {
				if (D.characters[0][C] == 1) {
					K = C
				}
			}
			for (var C in D.characters[1]) {
				if (D.characters[1][C] == 2) {
					R = C
				}
			}
			var T, M, I, P, Q, w, A, E, z;
			var V = J ? l[0].findCharacterPosById(K) : "";
			var U = J ? l[1].findCharacterPosById(R) : "";
			if (J) {
				if (V < 0 || U < 0) {
					var H, G, L, S;
					if (V < 0) {
						H = 0;
						G = K;
						L = D.char_cids[0];
						S = jQuery(".snippets div.item").clone();
						S.attr("data-cid", G);
						S.attr("data-voice", "eric");
						S.attr("data-thumb", customCCHeadsBaseUrl + L + ".png");
						jQuery("img", S).attr("src", customCCThumbsBaseUrl + L + ".png");
						S.appendTo("div.character div.items");
						GoLite.addCC(null, H)
					}
					if (U < 0) {
						H = 1;
						G = R;
						L = D.char_cids[1];
						S = jQuery(".snippets div.item").clone();
						S.attr("data-cid", G);
						S.attr("data-voice", "eric");
						S.attr("data-thumb", customCCHeadsBaseUrl + L + ".png");
						jQuery("img", S).attr("src", customCCThumbsBaseUrl + L + ".png");
						S.appendTo("div.character div.items");
						GoLite.addCC(null, H)
					}
				}
			}
			var B = D.script.length;
			for (var O = 0; O < B; O++) {
				I = D.script[O].char_num;
				P = I - 1;
				Q = i ? D.script[O].facial[I] : "";
				w = D.script[O].aid;
				A = D.script[O].cid;
				E = D.script[O].sorder;
				z = D.script[O].voice;
				thisText = D.script[O].text;
				thisType = D.script[O].type;
				if (VoiceCatalog.lookupVoiceInfo(z) === null) {
					z = VoiceCatalog.getDefaultVoice()
				}
				if (O > 0) {
					if (i) {
						GoLite.insertDialog({
							charId: P,
							facial: Q,
							focus: false
						})
					} else {
						GoLite.insertDialog({
							charId: P,
							focus: false
						})
					}
					e(document).trigger("insert.scriptDialog");
					T = jQuery("#dialogs .dialog:not(.fake)");
					M = T.eq(O)
				} else {
					T = jQuery("#dialogs .dialog:not(.fake)");
					M = T.eq(0);
					M.data("charId", P);
					if (i) {
						M.trigger("updateFacial", [Q, facialExpression.name(Q)])
					}
				}
				M.data("aid", w);
				M.data("aidbkup", w);
				M.data("textbkup", thisText);
				M.data("voicebkup", z);
				M.data("sorder", E);
				M.data("voice", z);
				if (J) {
					var F = l[P].findCharacterPosById(A);
					l[P].gotoByOffset(F);
					a[P] = l[P].getItem();
					a[P].data("voice", z)
				}
				M.data("method", D.dialog_methods[O]);
				M.trigger("initInput", [w]);
				if (M.data("method") == "mic") {
					e(".dialog_" + M.data("method"), M).siblings().removeClass("on").end().addClass("on")
				}
				if (M.data("method") == "tts") {
					M.find(".dialog_input").val(thisText).trigger("change");
					M.find(".counter").hide()
				}
			}
			if (J) {
				var V = l[0].findCharacterPosById(K);
				var U = l[1].findCharacterPosById(R);
				if (V >= 0) {
					l[0].gotoByOffset(V)
				}
				if (U >= 0) {
					l[1].gotoByOffset(U)
				}
			}
			jQuery(document).trigger("GoLite.stateChange", []);
			initModeForEdit = false;
			return true
		},
		noticifyChange: function () {
			if (s) {
				e(document).trigger("GoLite.stateChange", [""])
			}
		},
		getUserState: function () {
			return c
		},
		updateUserState: function (w) {
			e.get("/ajax/getUserMetaInfo", function (y) {
				if (y.error) {
					c = 0
				} else {
					c = 1;
					if (y.plus == 1 || y.role == "admin") {
						c = 2;
						if (y.business == 1 || y.role == "admin") {
							c = 3
						}
						e("#templates .plus-cover").remove();
						e(".plus-character").html(e(".snippets .plus-char-txt").clone());
						e("#dialogs .max").hide()
					}
					e("div.character .customlink").addClass(y.plus == 1 ? "isplus" : "isbasic")
				}
				e("#dialogs .dialog_input_message").find(".basic").toggle(c < 2).end().find(".plus").toggle(c >= 2);
				e("#dialogs .upsell, #step4 .upsell").toggle(c < 2);
				g();
				if (w && typeof w == "function") {
					w(c)
				}
			}, "json")
		},
		showSelectCCOverlay: function (y) {
			var w = GoLite.getCharacters();
			var z = new SelectCCDialog(jQuery(".snippets .selectccoverlay").clone(), y, (c >= 2));
			z.setDefaultCharacterById(w[y].data("cid"));
			z.setDefaultVoice(w[y].data("voice"));
			z.show()
		},
		showSelectVoiceOverlay: function (y) {
			var w = GoLite.getCharacters();
			var z = new SelectVoiceDialog(jQuery(".snippets .selectvoiceoverlay").clone(), y, (c >= 2));
			z.setDefaultVoice(w[y].data("voice"));
			z.show()
		},
		addCC: function (y, w) {
			e.each(l, function (B, A) {
				var z = A.findCharacterPosById(y);
				if (z < 0) {
					A.addItem();
					z = A.getItems().length - 1
				}
				if (w != null && B == w) {
					l[B].gotoByOffset(z)
				}
			})
		},
		getWatermarks: function () {
			b && getWatermarks(b)
		}
	}
})(jQuery);

function blockUICenterX() {
	$block = jQuery(".blockUI.blockMsg");
	$block.css("left", (jQuery(window).width() - $block.width()) / 2 + jQuery(window).scrollLeft() + "px")
}

function showOverlay(c, a) {
	a = a || {};
	var b = {
		padding: 0,
		margin: 0,
		width: "auto",
		top: "120px",
		left: "29%",
		textAlign: "center",
		color: "#000",
		border: "none",
		backgroundColor: "transparent",
		cursor: "auto"
	};
	jQuery.extend(b, a);
	jQuery.blockUI({
		message: c,
		css: b,
		overlayCSS: {
			cursor: "auto"
		}
	});
	blockUICenterX()
}

function showNotice(c, a) {
	a = typeof (a) != "undefined" ? a : false;
	var b = jQuery('<div class="growlUI"></div>');
	b.toggleClass("error", a);
	b.append("<h1>Notification</h1>");
	b.append("<h2>" + c + "</h2>");
	jQuery.blockUI({
		message: b,
		fadeIn: 700,
		fadeOut: 700,
		centerY: false,
		timeout: 5000,
		showOverlay: false,
		css: {
			width: "350px",
			top: "10px",
			left: "",
			right: "10px",
			textAlign: "left",
			border: "none",
			padding: "15px",
			backgroundColor: "#000",
			"-webkit-border-radius": "10px",
			"-moz-border-radius": "10px",
			"border-radius": "10px",
			opacity: 0.8,
			color: "#fff"
		}
	})
}
var psWin = null,
	psHook = "";

function popUpgrade(b) {
	if (psWin && !psWin.closed) {
		psWin.focus()
	} else {
		var a = "https://goanimate.com/business/videoplans?hook=golite.site";
		if (view_name == "youtube") {
			a = "https://goanimate.com/?ui=popup&app=youtube&hook=golite.site"
		}
		if (b) {
			a += "&hook=" + b
		} else {
			if (psHook) {
				a += "&hook=" + psHook
			}
		}
		showOverlay(jQuery("#upgrade"));
		psWin = window.open(a, "gapayment")
	}
}

function showPublish() {
	if (view_name == "youtube") {
		if (jQuery("#publish").length == 0) {
			jQuery.get("/ajax/publishForm", function (a) {
				jQuery("body").append(a);
				showOverlay(jQuery("#publish"))
			})
		} else {
			showOverlay(jQuery("#publish"))
		}
		dataLayer.push({
			event: "ga-pageview-t1",
			path: "/pageTracker/ajax/overlay/publish/true"
		});
		return
	}
}

function customCharSignup() {
	psHook = "golite_customcharacter.site";
	popUpgrade()
}

function SelectCCDialog(g, a, c) {
	var d = VoiceCatalog.getModel();
	var f = new VoiceSelectionWidget(jQuery(".voiceselectorwidget", g), d, c);
	var b = new CCBrowserSimple(jQuery(".ccbrowsercontainer", g), customCC_model);
	var e = function () {
		if (f.getSelectedVoice() == null) {
			window.alert(GT.gettext("Please select a voice for the character"));
			return
		}
		if (b.getSelectedCc() == null) {
			window.alert(GT.gettext("Please select a character"));
			return
		}
		var n = GoLite.getCharacters();
		var h = n[a].data("voice") != f.getSelectedVoice();
		var o = b.getSelectedCc();
		var l = jQuery("div.character div.items").find(".item").filter(function () {
			return jQuery(this).data("cid") == o.id
		});
		var m = f.getSelectedVoice();
		if (l.size() <= 0) {
			var k = jQuery(".snippets div.item").clone();
			k.data("cid", o.id).data("voice", m).data("thumb", o.head_url);
			jQuery("img", k).attr("src", o.thumb_url);
			k.appendTo("div.character div.items")
		} else {
			jQuery.each(l, function () {
				jQuery(this).data("voice", m)
			})
		}
		GoLite.addCC(o.id, a);
		if (h) {
			var i = n[a].data("cid");
			var j = [];
			jQuery.each(n, function (p) {
				if (jQuery(this).data("cid") == i) {
					j.push(p)
				}
			});
			jQuery(".dialog").each(function (p, q) {
				if (jQuery(q).data("method") == "tts" && jQuery.inArray(jQuery(q).data("charId"), j) >= 0) {
					jQuery(q).removeData("aid")
				}
			});
			if (j.length > 0) {
				GoLite.noticifyChange()
			}
		}
		jQuery.unblockUI()
	};
	dataLayer.push({
		event: "ga-pageview-t1",
		path: "/pageTracker/golite/selectccdialog"
	});
	return {
		setDefaultCharacterById: function (h) {
			b.setSelectedCcById(h)
		},
		setDefaultVoice: function (h) {
			f.selectVoiceById(h)
		},
		show: function () {
			jQuery("#voiceselect_confirm", g).click(e);
			jQuery("#voiceselect_plusupgrade", g).click(function () {
				popUpgrade("golite_customvoice.site")
			});
			showOverlay(g);
			f.onChange(function (j) {
				var h = j.data("voice-info");
				var i = (!h.plus || c);
				(jQuery("#voiceselect_confirm", g))[i ? "show" : "hide"]();
				(jQuery("#voiceselect_plusupgrade", g))[i ? "hide" : "show"]()
			});
			jQuery(".voiceselectorwidget", g).trigger("display", [])
		}
	}
}

function SelectVoiceDialog(f, a, b) {
	var c = VoiceCatalog.getModel();
	var e = new VoiceSelectionWidget(jQuery(".voiceselectorwidget", f), c, b);
	var d = function () {
		if (e.getSelectedVoice() == null) {
			window.alert(GT.gettext("Please select a voice for the character"));
			return
		}
		var l = GoLite.getCharacters();
		var g = l[a].data("voice") != e.getSelectedVoice();
		var j = jQuery(l).filter(function () {
			return jQuery(this).data("cid") == l[a].data("cid")
		});
		var k = e.getSelectedVoice();
		if (g) {
			jQuery.each(j, function () {
				jQuery(this).data("voice", k)
			});
			var h = l[a].data("cid");
			var i = [];
			jQuery.each(l, function (m) {
				if (jQuery(this).data("cid") == h) {
					i.push(m)
				}
			});
			jQuery(".dialog").each(function (m, n) {
				if (jQuery(n).data("method") == "tts" && jQuery.inArray(jQuery(n).data("charId"), i) >= 0) {
					jQuery(n).trigger("updatevoice", [k]).removeData("aid")
				}
			});
			if (i.length > 0) {
				GoLite.noticifyChange()
			}
		}
		jQuery.unblockUI()
	};
	dataLayer.push({
		event: "ga-pageview-t1",
		path: "/pageTracker/golite/selectvoicedialog"
	});
	return {
		setDefaultVoice: function (g) {
			e.selectVoiceById(g)
		},
		show: function () {
			jQuery("#voiceselectonly_confirm", f).click(d);
			jQuery("#voiceselectonly_plusupgrade", f).click(function () {
				popUpgrade("golite_customvoice.site")
			});
			showOverlay(f);
			e.onChange(function (i) {
				var g = i.data("voice-info");
				var h = (!g.plus || b);
				(jQuery("#voiceselectonly_confirm", f))[h ? "show" : "hide"]();
				(jQuery("#voiceselectonly_plusupgrade", f))[h ? "hide" : "show"]()
			});
			jQuery(".voiceselectorwidget", f).trigger("display", [])
		}
	}
}
var VoiceLanguageDisplay = function (b) {
	var a = null;
	b.click(function () {
		GoLite.showSelectVoiceOverlay(b.parents(".dialog").data("charId"))
	});
	var c = {
		updateByVoiceId: function (d) {
			var e = VoiceCatalog.lookupVoiceInfo(d);
			var f = {
				gender: e.sex,
				locale: e.locale
			};
			if ((a && a.gender) != f.gender || (a && a.locale) != f.locale) {
				a = f;
				b.find(".gender").removeClass().addClass("gender " + f.gender);
				b.find(".lang").removeClass().addClass("lang " + (f.locale.country || ("lg_" + f.locale.lang)))
			}
		}
	};
	return c
};
(function (a) {
	a.InFieldLabels = function (c, e, b) {
		var d = this;
		d.$label = a(c);
		d.$field = a(e);
		d.$label.data("InFieldLabels", d);
		d.showing = true;
		d.init = function () {
			d.options = a.extend({}, a.InFieldLabels.defaultOptions, b);
			if (d.$field.val() != "") {
				d.$label.hide();
				d.showing = false
			}
			d.$label.click(function () {
				d.$field.focus()
			});
			d.$field.focus(function () {
				d.fadeOnFocus()
			}).blur(function () {
				d.checkForEmpty(true)
			}).bind("keydown.infieldlabel", function (f) {
				d.hideOnChange(f)
			}).change(function (f) {
				d.checkForEmpty()
			}).bind("onPropertyChange", function () {
				d.checkForEmpty()
			})
		};
		d.fadeOnFocus = function () {
			if (d.showing) {
				d.setOpacity(d.options.fadeOpacity)
			}
		};
		d.setOpacity = function (f) {
			d.$label.stop().animate({
				opacity: f
			}, d.options.fadeDuration);
			d.showing = (f > 0)
		};
		d.checkForEmpty = function (f) {
			if (d.$field.val() == "") {
				d.prepForShow();
				d.setOpacity(f ? 1 : d.options.fadeOpacity)
			} else {
				d.setOpacity(0)
			}
		};
		d.prepForShow = function (f) {
			if (!d.showing) {
				d.$label.css({
					opacity: 0
				}).show();
				d.$field.bind("keydown.infieldlabel", function (g) {
					d.hideOnChange(g)
				})
			}
		};
		d.hideOnChange = function (f) {
			if ((f.keyCode == 16) || (f.keyCode == 9)) {
				return
			}
			if (d.showing) {
				d.$label.hide();
				d.showing = false
			}
			d.$field.unbind("keydown.infieldlabel")
		};
		d.init()
	};
	a.InFieldLabels.defaultOptions = {
		fadeOpacity: 0.5,
		fadeDuration: 300
	};
	a.fn.inFieldLabels = function (b) {
		return this.each(function () {
			var c = a(this).find(".label");
			if (!c.length) {
				return
			}
			var d = a(this).find("input[type='text'],input[type='password'],textarea");
			if (d.length == 0) {
				return
			}(new a.InFieldLabels(c[0], d[0], b))
		})
	}
})(jQuery);