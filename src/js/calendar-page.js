import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Pane } from "tweakpane";

// 1 раз регистрируем и все
gsap.registerPlugin(ScrollTrigger);

let layersCtrl;
let centerCtrl;
let staggerCtrl;
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

const ctrl = new Pane({
	title: "Config",
	expanded: true,
});

ctrl.dispose()

const update = () => {
	document.documentElement.dataset.theme = config.theme;
	document.documentElement.dataset.enhanced = config.enhanced;
	document.documentElement.dataset.stick = config.stick;
	document.documentElement.dataset.center = config.center;
	document.documentElement.dataset.layers = config.layers;
	document.documentElement.dataset.stagger = config.stagger;

	// управляем видимостью контролов
	if (hasScrollSupport) {
		if (layersCtrl) layersCtrl.hidden = !config.enhanced;
		if (staggerCtrl) staggerCtrl.hidden = !config.enhanced;
		if (centerCtrl) centerCtrl.hidden = !config.enhanced;
	}

	if (config.enhanced && !hasScrollSupport) {
		// ВАЖНО: убиваем старые таймлайны перед созданием новых, иначе при каждом update будет утечка
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
		// сбрасываем стили правильно через clearProps
		gsap.set([".scaler img", ".layer"], { clearProps: "all" });
		scalerTl?.kill();
		layersTl?.kill();
		scalerTl = undefined;
		layersTl = undefined;
	}
};

const sync = (event) => {
	if (
		!document.startViewTransition ||
		event.target.controller.view.labelElement.innerText !== "Theme"
	)
		return update();
	document.startViewTransition(() => update());
};

ctrl.addBinding(config, "enhanced", { label: "Enhance" });

if (hasScrollSupport) {
	centerCtrl = ctrl.addBinding(config, "center", {
		label: "Center",
		hidden: !config.enhanced,
	});
	layersCtrl = ctrl.addBinding(config, "layers", {
		label: "Layers",
		hidden: !config.enhanced,
	});
	staggerCtrl = ctrl.addBinding(config, "stagger", {
		label: "Stagger",
		options: {
			Range: "range", Timing: "timing"
		},
		hidden: !config.enhanced,
	});
}

ctrl.addBinding(config, "stick", { label: "Stick" });
ctrl.addBinding(config, "theme", {
	label: "Theme",
	options: {
		System: "system", Light: "light", Dark: "dark"
	},
});

ctrl.on("change", sync);
update();