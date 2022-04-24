/**
 * dropdowns
 */
$(document).on("click", ".dropdown-toggle", event => {
	const clicked = $(event.target);
    const dropdown = clicked.siblings(".dropdown-menu");

	dropdown.parent().addClass("open");

	event.preventDefault();
	event.stopPropagation();

	$("body").one("click", (e) => {
		if (!$(e.target).closest(event.target).length) {
			dropdown.parent().removeClass("open");
		}
	});
});