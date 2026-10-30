import './styles/expert.scss';
import $ from 'jquery';
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { SplitText } from "gsap/SplitText";

$(document).ready(function () {

	var curPage = 1;
	var numOfPages = $(".skw-page").length;
	var animTime = 1000;
	var scrolling = false;
	var pgPrefix = ".skw-page-";

	function pagination() {
		scrolling = true;

		$(pgPrefix + curPage).removeClass("inactive").addClass("active");
		$(pgPrefix + (curPage - 1)).addClass("inactive");
		$(pgPrefix + (curPage + 1)).removeClass("active");

		setTimeout(function () {
			scrolling = false;
		}, animTime);
	};

	function navigateUp() {
		if (curPage === 1) return;
		curPage--;
		pagination();
	};

	function navigateDown() {
		if (curPage === numOfPages) return;
		curPage++;
		pagination();
	};

	// Стандартное событие wheel работает во всех браузерах (в Firefox старые
	// mousewheel / DOMMouseScroll не приходят, если wheel отменён через preventDefault)
	$(document).on("wheel", function (e) {
		if (scrolling) return;

		var ev = e.originalEvent;
		// deltaMode 1 = строки (колесо мыши в Firefox), приводим к пикселям
		var dy = ev.deltaY * (ev.deltaMode === 1 ? 16 : 1);

		// игнорируем мелкие «хвосты» инерции тачпада
		if (Math.abs(dy) < 10) return;

		if (dy < 0) {
			navigateUp();
		} else {
			navigateDown();
		}
	});

	$(document).on("keydown", function (e) {
		if (scrolling) return;
		if (e.which === 38) {
			navigateUp();
		} else if (e.which === 40) {
			navigateDown();
		}
	});

});

// -- Mobile view
gsap.registerPlugin(Observer, SplitText);

let sections = document.querySelectorAll("section"),
	images = document.querySelectorAll(".bg"),
	headings = gsap.utils.toArray(".section-heading"),
	// по одному абзацу на секцию (если у секции его нет — будет null, анимация пропустится)
	descriptions = Array.from(sections).map(s => s.querySelector(".section-description")),
	outerWrappers = gsap.utils.toArray(".outer"),
	innerWrappers = gsap.utils.toArray(".inner"),
	splitHeadings = headings.map(heading => new SplitText(heading, { type: "chars,words,lines", linesClass: "clip-text" })),
	splitDescriptions = [],
	currentIndex = -1,
	wrap = gsap.utils.wrap(0, sections.length),
	animating;

animating = true;

gsap.set(outerWrappers, { yPercent: 100 });
gsap.set(innerWrappers, { yPercent: -100 });

function gotoSection(index, direction) {
	index = wrap(index); // make sure it's valid
	animating = true;
	let fromTop = direction === -1,
		dFactor = fromTop ? -1 : 1,
		tl = gsap.timeline({
			defaults: { duration: 1.25, ease: "power1.inOut" },
			onComplete: () => animating = false
		});
	if (currentIndex >= 0) {
		gsap.set(sections[currentIndex], { zIndex: 0 });
		tl.to(images[currentIndex], { yPercent: -15 * dFactor })
			.set(sections[currentIndex], { autoAlpha: 0 });
	}
	gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
	tl.fromTo([outerWrappers[index], innerWrappers[index]], {
		yPercent: i => i ? -100 * dFactor : 100 * dFactor
	}, {
		yPercent: 0
	}, 0)
		.fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0)
		.fromTo(splitHeadings[index].chars, {
			autoAlpha: 0,
			yPercent: 150 * dFactor
		}, {
			autoAlpha: 1,
			yPercent: 0,
			duration: 1,
			ease: "power2",
			stagger: {
				each: 0.02,
				from: "random"
			}
		}, 0.2);

	if (splitDescriptions[index]) {
		tl.fromTo(splitDescriptions[index].lines, {
			autoAlpha: 0,
			yPercent: 110 * dFactor
		}, {
			autoAlpha: 1,
			yPercent: 0,
			duration: 1,
			ease: "power2",
			stagger: 0.12
		}, 0.5);
	}
	currentIndex = index;
}

// Observer нужен только на мобильных: на ПК секции скрыты (display: none),
// а Observer с preventDefault перехватывал колесо/тачпад и крутил невидимые анимации
const mobileQuery = window.matchMedia("(max-width: 768px)"); // тот же порог, что в _responsive-expert.scss

const observer = Observer.create({
	type: "wheel,touch,pointer",
	wheelSpeed: -1,
	onDown: () => !animating && gotoSection(currentIndex - 1, -1),
	onUp: () => !animating && gotoSection(currentIndex + 1, 1),
	tolerance: 10,
	preventDefault: true
});

const toggleObserver = () => mobileQuery.matches ? observer.enable() : observer.disable();
toggleObserver();
mobileQuery.addEventListener("change", toggleObserver);

document.fonts.ready.then(() => {
	splitDescriptions = descriptions.map(p =>
		p ? new SplitText(p, { type: "lines", mask: "lines" }) : null
	);
	gotoSection(0, 1);
});