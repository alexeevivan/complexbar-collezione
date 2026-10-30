import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let scalerTl;
let layersTl;

const hasScrollSupport = CSS.supports(
	"(animation-timeline: view()) and (animation-range: 0 100%)"
);

const config = {
	theme: "system",
	enhanced: true,
	stick: true,
	layers: true,
	center: true,
	stagger: "range",
};

const update = () => {
	const hasGalleryElements = document.querySelector('.scaler img') && document.querySelector('.layer');

	if (!hasGalleryElements) {
		return;
	}

	document.documentElement.dataset.theme = config.theme;
	document.documentElement.dataset.enhanced = config.enhanced;
	document.documentElement.dataset.stick = config.stick;
	document.documentElement.dataset.center = config.center;
	document.documentElement.dataset.layers = config.layers;
	document.documentElement.dataset.stagger = config.stagger;

	if (config.enhanced && !hasScrollSupport) {
		// Убиваем старые таймлайны перед созданием новых, иначе будет утечка
		scalerTl?.kill();
		layersTl?.kill();

		scalerTl = gsap
			.timeline({
				scrollTrigger: {
					trigger: "main section:first-of-type",
					start: "top -10%",
					end: "bottom 80%",
					scrub: true,
				},
			})
			.from(".scaler img", { height: window.innerHeight - 32, ease: "power1.inOut" }, 0)
			.from(".scaler img", { width: window.innerWidth - 32, ease: "power2.inOut" }, 0);

		layersTl = gsap
			.timeline({
				scrollTrigger: {
					trigger: "main section:first-of-type",
					start: "top -40%",
					end: "bottom bottom",
					scrub: true,
				},
			})
			.from(".layer:nth-of-type(1)", { opacity: 0, ease: "sine.out" }, 0)
			.from(".layer:nth-of-type(1)", { scale: 0, ease: "power1.inOut" }, 0)
			.from(".layer:nth-of-type(2)", { opacity: 0, ease: "sine.out" }, 0)
			.from(".layer:nth-of-type(2)", { scale: 0, ease: "power3.inOut" }, 0)
			.from(".layer:nth-of-type(3)", { opacity: 0, ease: "sine.out" }, 0)
			.from(".layer:nth-of-type(3)", { scale: 0, ease: "power4.inOut" }, 0);
	} else if (!config.enhanced || hasScrollSupport) {
		// Сбрасываем стили через clearProps
		gsap.set([".scaler img", ".layer"], { clearProps: "all" });
		scalerTl?.kill();
		layersTl?.kill();
		scalerTl = undefined;
		layersTl = undefined;
	}
};

update();
