var ImporterShare = function (a) {
	this.$el = a;
	this.$selectAllCheckbox = this.$el.find(".select-all-checkbox");
	this.$list = this.$el.find(".ga-importer-share-assets");
	this.$shareButton = this.$el.find('[data-action="share-assets"]');
	this.$memberSelectButtonText = this.$el.find("#member-select-button-text");
	this.$memberSelectMenu = this.$el.find("#member-select-menu");
	this.$memberSelectItemNone = this.$el.find("#member-select-item-none");
	this.$memberSelectItemTeam = this.$el.find("#member-select-item-team");
	this.processing = false;
	this.selectableMembersCount = 0;
	this.selectedMembers = [];
	this.initialize()
};
ImporterShare.prototype.initialize = function () {
	var f = this,
		a = function () {
			f.$memberSelectMenu.find(".member-select-item").each(function () {
				if ($(this).val() === "none") {
					$(this).prop("checked", true)
				} else {
					$(this).prop("checked", false)
				}
			});
			f.selectedMembers = [];
			f.$memberSelectButtonText.text("No sharing")
		},
		b = function () {
			a()
		},
		e = function () {
			f.$memberSelectMenu.find(".member-select-item").each(function () {
				if ($(this).val() === "none") {
					$(this).prop("checked", false)
				} else {
					if ($(this).val() === "team") {
						$(this).prop("checked", true)
					} else {
						$(this).prop("checked", true);
						f.selectedMembers.push($(this).val())
					}
				}
			});
			f.$memberSelectButtonText.text("All members")
		},
		g = function () {
			if (f.selectedMembers.length === 0) {
				a()
			} else {
				f.$memberSelectButtonText.text(f.selectedMembers.length + " member(s)")
			}
		},
		c = function (h) {
			f.$memberSelectItemNone.prop("checked", false);
			f.selectedMembers.push(h);
			if (f.selectedMembers.length === f.selectableMembersCount) {
				f.$memberSelectItemTeam.prop("checked", true);
				f.$memberSelectButtonText.text("All members")
			} else {
				f.$memberSelectButtonText.text(f.selectedMembers.length + " member(s)")
			}
		},
		d = function (h) {
			var i = [];
			f.$memberSelectItemTeam.prop("checked", false);
			$.each(f.selectedMembers, function (k, j) {
				if (j !== h) {
					i.push(j)
				}
			});
			f.selectedMembers = i;
			if (f.selectedMembers.length === 0) {
				f.$memberSelectItemNone.prop("checked", true);
				f.$memberSelectButtonText.text("No sharing")
			} else {
				f.$memberSelectButtonText.text(f.selectedMembers.length + " member(s)")
			}
		};
	this.$el.on("click", ".quit", function (h) {
		h.preventDefault();
		f.$el.trigger("quit")
	}).on("change", '.share-asset input[type="checkbox"]', function () {
		var j = $(this).prop("checked");
		var h = true;
		if (j) {
			f.$list.find('input[type="checkbox"]').each(function () {
				if ($(this).prop("checked") === false) {
					h = false
				}
			})
		} else {
			h = false
		}
		f.$selectAllCheckbox.prop("checked", h);
		var i = (f.$list.find('input[type="checkbox"]:checked').length > 0);
		f.$shareButton.prop("disabled", !i)
	});
	this.$shareButton.on("click", function (h) {
		h.preventDefault();
		f.share()
	});
	this.$selectAllCheckbox.on("change", function () {
		var h = $(this).prop("checked");
		if (f.$list.children().length > 0) {
			f.$list.find('input[type="checkbox"]').prop("checked", h);
			f.$shareButton.prop("disabled", !h)
		}
	});
	$.post("/api_v2/team/members", function (i) {
		var h = null;
		if (i.status !== "ok") {
			return
		}
		h = i.data;
		$.each(h, function (k, j) {
			if (!j.isMe) {
				if (j.isAdmin) {
					f.$memberSelectMenu.append('<li><a href="#"><input class="member-select-item" type="checkbox" value="' + j.userId + '" checked> ' + j.name + " (admin)</a></li>")
				} else {
					f.$memberSelectMenu.append('<li><a href="#"><input class="member-select-item" type="checkbox" value="' + j.userId + '" checked> ' + j.name + "</a></li>")
				}
				f.selectableMembersCount += 1
			}
		});
		f.$memberSelectMenu.find(".member-select-item").each(function () {
			if ($(this).val() === "none") {
				$(this).on("change", function () {
					var j = $(this).prop("checked");
					if (j) {
						a()
					} else {
						b()
					}
				})
			} else {
				if ($(this).val() === "team") {
					$(this).on("change", function () {
						var j = $(this).prop("checked");
						if (j) {
							e()
						} else {
							g()
						}
					})
				} else {
					$(this).on("change", function () {
						var j = $(this).prop("checked");
						if (j) {
							c($(this).val())
						} else {
							d($(this).val())
						}
					})
				}
			}
			$(this).parent().on("click", function (j) {
				j.stopPropagation()
			})
		})
	}, "json")
};
ImporterShare.prototype.addAssets = function (b) {
	var a = this;
	$.each(b, function () {
		var c = this.asset.encrypt_id;
		if (a.$list.find("#share-asset-" + c).length > 0) {
			return
		}
		var e = a.renderAsset();
		var d = new ImporterShareAsset(this, e);
		e.data("importerShareAsset", d);
		a.$list.append(e)
	})
};
ImporterShare.prototype.deleteAsset = function (a) {
	this.$el.find("#share-asset-" + a).remove()
};
ImporterShare.prototype.renderAsset = function () {
	var a = $("#importer-share-asset-tmpl").tmpl();
	return $(a)
};
ImporterShare.prototype.share = function () {
	if (this.processing) {
		return
	}
	var c = null;
	if (this.$memberSelectItemNone.prop("checked") === true) {
		c = {
			type: "none"
		}
	} else {
		if (this.$memberSelectItemTeam.prop("checked") === true) {
			c = {
				type: "team"
			}
		} else {
			c = {
				type: "shared",
				userIds: this.selectedMembers
			}
		}
	}
	var a = this,
		d = [],
		b = {
			assets: []
		};
	this.$list.children(".share-asset").each(function () {
		var e = $(this).data("importerShareAsset");
		if (!e.isSelected()) {
			return
		}
		b.assets.push({
			id: e.data.asset.encrypt_id,
			share: c
		});
		d.push(e)
	});
	if (d.length < 1) {
		return
	}
	this.processing = true;
	$.ajax("/ajax/shareAssets", {
		data: JSON.stringify(b),
		type: "POST",
		processData: false,
		contentType: "application/json",
		dataType: "json"
	}).done(function (e) {
		a.processing = false;
		if (e.error) {
			return
		}
		$.each(d, function () {
			this.setStatus(c.type)
		})
	})
};
var ImporterShareAsset = function (b, a) {
	this.data = b;
	this.$el = a;
	this.status = "none";
	this.initialize()
};
ImporterShareAsset.prototype.initialize = function () {
	this.$el.attr("id", "share-asset-" + this.data.asset.encrypt_id);
	this.$el.find(".filename").text(this.data.file.name);
	this.$el.find(".category").text(this.data.category);
	this.setIcon();
	this.$el.find(".share-type > span").tooltip()
};
ImporterShareAsset.prototype.setStatus = function (a) {
	this.status = a;
	this.$el.find(".share-type").attr("class", "share-type " + this.status)
};
ImporterShareAsset.prototype.setIcon = function () {
	var a = this.$el.find(".share-asset-icon");
	if (this.data.asset.thumbnail) {
		var b = $("<img>").attr("src", this.data.asset.thumbnail);
		a.html(b)
	} else {
		a.addClass(this.data.asset.type)
	}
};
ImporterShareAsset.prototype.isSelected = function () {
	return this.$el.find('input[type="checkbox"]').prop("checked")
};