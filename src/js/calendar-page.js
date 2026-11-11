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


// -- Holo Cards

document.querySelectorAll('.fxwrap').forEach((wrap) => {
	const card = wrap.querySelector('.fxcard');
	if (!card) return;

	let raf = null;
	let target = { rx: 0, ry: 0, px: 50, py: 50 };
	let cur = { rx: 0, ry: 0, px: 50, py: 50 };

	function apply() {
		cur.rx += (target.rx - cur.rx) * 0.16;
		cur.ry += (target.ry - cur.ry) * 0.16;
		cur.px += (target.px - cur.px) * 0.16;
		cur.py += (target.py - cur.py) * 0.16;
		card.style.setProperty('--rx', cur.rx.toFixed(2) + 'deg');
		card.style.setProperty('--ry', cur.ry.toFixed(2) + 'deg');
		card.style.setProperty('--mx', cur.px.toFixed(2) + '%');
		card.style.setProperty('--my', cur.py.toFixed(2) + '%');
		if (
			Math.abs(target.rx - cur.rx) > 0.01 ||
			Math.abs(target.ry - cur.ry) > 0.01 ||
			Math.abs(target.px - cur.px) > 0.05 ||
			Math.abs(target.py - cur.py) > 0.05
		) {
			raf = requestAnimationFrame(apply);
		} else {
			raf = null;
		}
	}
	function kick() { if (!raf) raf = requestAnimationFrame(apply); }

	function onMove(e) {
		const r = wrap.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width;
		const y = (e.clientY - r.top) / r.height;
		const MAX = 14;
		target.ry = (x - 0.5) * 2 * MAX;
		target.rx = -(y - 0.5) * 2 * MAX;
		target.px = Math.max(0, Math.min(100, x * 100));
		target.py = Math.max(0, Math.min(100, y * 100));
		kick();
	}
	function onEnter() { card.classList.add('is-active'); }
	function onLeave() {
		card.classList.remove('is-active');
		target = { rx: 0, ry: 0, px: 50, py: 50 };
		kick();
	}

	// pointermove covers mouse + touch + pen
	wrap.addEventListener('pointermove', onMove);
	wrap.addEventListener('pointerenter', onEnter);
	wrap.addEventListener('pointerleave', onLeave);
	// also handle pointerdown on mobile so the holo activates on tap
	wrap.addEventListener('pointerdown', onEnter);
	wrap.addEventListener('pointerup', onLeave);
	wrap.addEventListener('pointercancel', onLeave);
});
