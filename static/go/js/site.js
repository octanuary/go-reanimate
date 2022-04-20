/**
 * dropdowns
 */
$(".dropdown-toggle").on("click", (event) => {
	const clicked = $(event.target);
    const dropdown = clicked.siblings(".dropdown-menu");

	dropdown.show();

	event.preventDefault();
	event.stopPropagation();

	$("body").one("click", (event) => {
		if (!$(event.target).closest(".dropdown-menu").length) {
			dropdown.hide();
		}
	});
});