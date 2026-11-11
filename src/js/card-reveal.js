// src/js/card-reveal.js
// 1) Порционный показ: сначала BATCH карточек, затем по BATCH при прокрутке.
//    Когда показаны все, контейнеру ставится класс is-complete — CSS показывает футер.
// 2) Анимация появления: каждая карточка плавно «выходит» (класс is-visible),
//    когда реально попадает в зону видимости — как на сайтах Apple.

const BATCH = 3; // должно совпадать с :nth-child(n+4) в стилях (BATCH + 1)

export function initCardReveal() {
	const container = document.querySelector('.card-container__cocktails[data-reveal]');
	if (!container) return undefined;

	const items = Array.from(container.querySelectorAll('.card-container__item'));
	const isDesktop = window.matchMedia('(min-width: 769px)').matches;
	let shown = Math.min(BATCH, items.length);
	let appearObserver;
	let batchObserver;
	let sentinel;

	container.classList.remove('is-complete');

	const cleanup = () => {
		appearObserver?.disconnect();
		batchObserver?.disconnect();
		sentinel?.remove();
		container.classList.remove('is-complete');
	};

	if (items.length === 0) {
		container.classList.add('is-complete');
		return cleanup;
	}

	// --- Анимация появления при входе карточки в экран ---
	if (isDesktop) {
		// На ПК наблюдаем строки по три карточки. Когда строка входит в viewport,
		// проявляем её целиком с небольшим каскадом слева направо.
		const rows = [];
		for (let index = 0; index < items.length; index += BATCH) {
			rows.push(items.slice(index, index + BATCH));
		}

		const rowByItem = new Map();
		rows.forEach((row) => row.forEach((item) => rowByItem.set(item, row)));

		appearObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				const row = rowByItem.get(entry.target);
				row.forEach((item, itemIndex) => {
					item.style.transitionDelay = `${itemIndex * 110}ms`;
					item.classList.add('is-visible');
					appearObserver.unobserve(item);
				});
			});
		}, {
			threshold: 0.15,
			rootMargin: '0px 0px -8% 0px'
		});

		items.forEach((item) => appearObserver.observe(item));
		container.classList.add('is-complete');
		return cleanup;
	}

	// На мобильных скрытые (display: none) карточки не пересекаются с экраном,
	// поэтому наблюдатель сработает сам после показа очередной порции.
	appearObserver = new IntersectionObserver((entries) => {
		const entering = entries.filter((entry) => entry.isIntersecting);

		entering.forEach((entry, i) => {
			entry.target.style.transitionDelay = `${i * 110}ms`;
			entry.target.classList.add('is-visible');
			appearObserver.unobserve(entry.target);
		});
	}, {
		threshold: 0.15,
		rootMargin: '0px 0px -8% 0px'
	});

	items.forEach((item) => appearObserver.observe(item));

	// --- Порционный показ ---
	const finish = () => {
		batchObserver?.disconnect();
		sentinel?.remove();
		container.classList.add('is-complete');
	};

	// Всё помещается в первую порцию — сразу показываем футер
	if (items.length <= BATCH) {
		finish();
		return cleanup;
	}

	// Невидимый «маяк» сразу после списка карточек
	sentinel = document.createElement('div');
	sentinel.className = 'card-container__sentinel';
	sentinel.setAttribute('aria-hidden', 'true');
	container.after(sentinel);

	const revealNext = () => {
		const next = items.slice(shown, shown + BATCH);
		next.forEach((item) => item.classList.add('is-revealed')); // снимает display: none
		shown += next.length;
	};

	batchObserver = new IntersectionObserver((entries) => {
		if (!entries[0].isIntersecting) return;

		revealNext();

		if (shown >= items.length) {
			finish();
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
	return cleanup;
}
