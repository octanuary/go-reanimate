/**
 * dropdowns
 */
$(".dropdown-toggle").on("click", (event) => {
	const clicked = $(event.target);
    const dropdown = clicked.siblings(".dropdown-menu");

	dropdown.show();

	event.preventDefault();
	event.stopPropagation();

	$("body").one("click", (e) => {
		if (!$(e.target).closest(event.target).length) {
			dropdown.hide();
		}
	});
});