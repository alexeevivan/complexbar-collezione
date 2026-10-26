import './styles/recipes.scss';
import './styles/main.scss';
import $ from 'jquery';

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
		
		// Убираем класс opened у всех заголовков на этом уровне
		allAtDepth.prev().filter(function() {
			return $.inArray(this.nodeName.toUpperCase(), headers) > -1;
		}).removeClass("opened");
		
		$(allAtDepth).slideUp("fast");

		// Проверяем, открыт ли элемент (перед toggle)
		var isCurrentlyVisible = subItem.is(":visible");

		//slideToggle target content and adjust bottom border if necessary
		subItem.slideToggle("fast", function () {
			$(".course-program__accordion :visible:last").css("border-radius", "10px");
		});
		
		// Управление классом opened: если был закрыт - добавляем, если открыт - убираем
		if (isCurrentlyVisible) {
			$(target).removeClass("opened");
		} else {
			$(target).addClass("opened");
		}
		
		$(target).css({ "border-radius": "10px" });
	}
});

// -- Animated block on mouse move (interactive title-block)

let interacted = false;

// Mouse-move following code
$("#interactive-app").on("pointermove", (e) => {
	interacted = true;
	const { x, y } = e.originalEvent;
	const BOX = e.target.getBoundingClientRect();
	const POINT = { x: x - BOX.x, y: y - BOX.y };
	const RATIO = { x: POINT.x / BOX.width, y: POINT.y / BOX.height };
	const CENTER = fromCenter(RATIO);

	// Set CSS variables referenced in CSS
	e.target.style.setProperty("--ratio-x", RATIO.x);
	e.target.style.setProperty("--ratio-y", RATIO.y);
	e.target.style.setProperty("--from-center", CENTER);
});

// Math function for distance from center
function fromCenter({ x, y }) {
	return Math.min(Math.max(0, Math.sqrt((y - .5) * (y - .5) + (x - .5) * (x - .5)) / .5), 1);
}

// Intro animation function
const intro = () => {
	// Lazy load triggers opacity
	$("#interactive-app").removeClass("loading");

	// Little intro demo animation
	$({ foo: 0 }).animate({ foo: (Math.PI * 2) }, {
		duration: 8000,
		easing: "swing",
		step: function (val) {
			if (!interacted) {
				const appElement = document.querySelector("#interactive-app");
				if (appElement) {
					appElement.style.setProperty("--ratio-x", (Math.cos(val) + 1.5) / 3);
					appElement.style.setProperty("--ratio-y", (Math.sin(val) + 2) / 4);
				}
			}
		},
		complete: function () {
			if (!interacted) {
				intro();
			}
		}
	});
}

// Initialize animation when images are loaded
$(document).ready(function () {
	const preloadImg = $(".glitter-preload");

	if (preloadImg.length > 0 && preloadImg[0].complete) {
		intro();
		console.log('Interactive animation started (image cached)');
	} else if (preloadImg.length > 0) {
		preloadImg.on("load", () => {
			intro();
			console.log('Interactive animation started (image loaded)');
		});
	}
});
