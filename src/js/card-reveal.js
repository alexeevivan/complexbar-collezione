// src/js/card-reveal.js
// 1) Порционный показ: сначала BATCH карточек, затем по BATCH при прокрутке.
//    Когда показаны все, контейнеру ставится класс is-complete — CSS показывает футер.
// 2) Анимация появления: каждая карточка плавно «выходит» (класс is-visible),
//    когда реально попадает в зону видимости — как на сайтах Apple.

const BATCH = 3; // должно совпадать с :nth-child(n+4) в стилях (BATCH + 1)

export function initCardReveal() {
	const container = document.querySelector('.card-container__cocktails[data-reveal]');
	if (!container) return;

	const items = Array.from(container.querySelectorAll('.card-container__item'));
	let shown = Math.min(BATCH, items.length);

	// --- Анимация появления при входе карточки в экран ---
	// Скрытые (display: none) карточки не пересекаются с экраном, поэтому
	// наблюдатель сработает сам, как только карточка будет показана порцией.
	const appearObserver = new IntersectionObserver((entries) => {
		const entering = entries.filter((entry) => entry.isIntersecting);

		entering.forEach((entry, i) => {
			// небольшой каскад, если в экран вошло сразу несколько карточек
			entry.target.style.transitionDelay = `${i * 110}ms`;
			entry.target.classList.add('is-visible');
			appearObserver.unobserve(entry.target);
		});
	}, {
		threshold: 0.15,                // карточка видна хотя бы на 15%
		rootMargin: '0px 0px -8% 0px'   // чуть выше нижнего края, чтобы анимацию было видно
	});

	items.forEach((item) => appearObserver.observe(item));

	// --- Порционный показ ---
	const finish = (observer, sentinel) => {
		if (observer) observer.disconnect();
		if (sentinel) sentinel.remove();
		container.classList.add('is-complete');
	};

	// Всё помещается в первую порцию — сразу показываем футер
	if (items.length <= BATCH) {
		finish();
		return;
	}

	// Невидимый «маяк» сразу после списка карточек
	const sentinel = document.createElement('div');
	sentinel.className = 'card-container__sentinel';
	sentinel.setAttribute('aria-hidden', 'true');
	container.after(sentinel);

	const revealNext = () => {
		const next = items.slice(shown, shown + BATCH);
		next.forEach((item) => item.classList.add('is-revealed')); // снимает display: none
		shown += next.length;
	};

	const batchObserver = new IntersectionObserver((entries) => {
		if (!entries[0].isIntersecting) return;

		revealNext();

		if (shown >= items.length) {
			finish(batchObserver, sentinel);
			return;
		}

		// Если маяк всё ещё в зоне видимости (высокий экран), перепроверяем:
		// повторное observe заново вызывает колбэк с актуальным состоянием.
		batchObserver.unobserve(sentinel);
		batchObserver.observe(sentinel);
	}, {
		rootMargin: '0px 0px 250px 0px' // подгружаем чуть раньше, чем маяк дойдёт до края экрана
	});

	batchObserver.observe(sentinel);
}