// src/js/header-scroll.js
// Фон шапки плавно проявляется по мере прокрутки секции .intro:
// с 25% её высоты (START) прозрачность растёт от 0 и достигает 1 к концу секции (END).
// Прогресс записывается в CSS-переменную --header-progress (0…1), дальше всё делает CSS.

const START = 0.25; // с какой доли высоты .intro начинается заливка
const END = 1;      // на какой доле высоты .intro заливка полностью готова

export function initHeaderScroll() {
	const header = document.querySelector('.header');
	const intro = document.querySelector('.intro');
	if (!header || !intro) return;

	let start = 0;
	let end = 1;
	let ticking = false;

	const update = () => {
		const range = Math.max(end - start, 1);
		const progress = Math.min(1, Math.max(0, (window.scrollY - start) / range));
		header.style.setProperty('--header-progress', progress.toFixed(3));
		ticking = false;
	};

	const measure = () => {
		const top = intro.getBoundingClientRect().top + window.scrollY;
		const height = intro.offsetHeight;
		start = top + height * START;
		end = top + height * END;
		update();
	};

	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(update); // не чаще одного раза за кадр
	};

	window.addEventListener('scroll', onScroll, { passive: true });

	// Пересчитываем границы, когда меняется размер секции (поворот экрана, загрузка картинок, шрифты)
	new ResizeObserver(measure).observe(intro);

	measure();
}