import './styles/recipes.scss';
import './styles/main.scss';

// -- course-program__accordion

var headers = ["H1", "H2", "H3", "H4", "H5", "H6"];

$(".course-program__accordion").click(function (e) {
	var target = e.target,
		name = target.nodeName.toUpperCase();

	if ($.inArray(name, headers) > -1) {
		var subItem = $(target).next();

		//slideUp all elements (except target) at current depth or greater
		var depth = $(subItem).parents().length;
		var allAtDepth = $(".course-program__accordion p, .course-program__accordion div").filter(function () {
			return $(this).parents().length >= depth && this !== subItem.get(0);
		});
		$(allAtDepth).slideUp("fast");

		//slideToggle target content and adjust bottom border if necessary
		subItem.slideToggle("fast", function () {
			$(".course-program__accordion :visible:last").css("border-radius", "10px");
		});
		$(target).css({ "border-radius": "10px" });
	}
});