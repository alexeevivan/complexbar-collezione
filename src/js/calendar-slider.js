// Calendar Slider with Gucci-style animation
class CalendarSlider {
	constructor(containerElement) {
		this.container = containerElement;
		this.monthList = this.container.querySelector('.calendar__month');
		this.slides = Array.from(this.container.querySelectorAll('.calendar__slide'));
		this.prevBtn = this.container.querySelector('.calendar__control-btn .prev').closest('.calendar__control-btn');
		this.nextBtn = this.container.querySelector('.calendar__control-btn .next').closest('.calendar__control-btn');

		// Блоки месяцев
		this.monthBlocks = Array.from(document.querySelectorAll('.user__month'));

		this.currentIndex = 0;
		this.isAnimating = false;
		this.touchStartY = 0;
		this.touchEndY = 0;

		this.init();
	}

	init() {
		// Устанавливаем начальное состояние
		this.updateSlides();
		this.updateMonthBlocks();

		// События для кнопок
		this.prevBtn.addEventListener('click', () => this.prev());
		this.nextBtn.addEventListener('click', () => this.next());

		// Поддержка свайпов на touch устройствах (вертикальные)
		this.monthList.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
		this.monthList.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

		// Keyboard navigation
		document.addEventListener('keydown', (e) => {
			const tag = (e.target.tagName || '').toLowerCase();
			if (['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return;
			if (e.key === 'ArrowUp') this.prev();
			if (e.key === 'ArrowDown') this.next();
		});
	}

	next() {
		if (this.isAnimating) return;

		const nextIndex = (this.currentIndex + 1) % this.slides.length;
		this.goToSlide(nextIndex, 'next'); // снизу вверх
	}

	prev() {
		if (this.isAnimating) return;

		const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
		this.goToSlide(prevIndex, 'prev'); // сверху вниз
	}

	goToSlide(targetIndex, direction) {
		if (this.isAnimating || targetIndex === this.currentIndex) return;

		this.isAnimating = true;
		const currentSlide = this.slides[this.currentIndex];
		const nextSlide = this.slides[targetIndex];

		// Синхронное переключение блоков месяцев
		const currentMonthBlock = this.monthBlocks[this.currentIndex];
		const nextMonthBlock = this.monthBlocks[targetIndex];

		// Убираем aria-hidden с будущего активного слайда
		nextSlide.setAttribute('aria-hidden', 'false');

		// Подготовка следующего слайда
		nextSlide.classList.add('calendar__slide--prepare');
		nextSlide.classList.add(direction === 'next' ? 'calendar__slide--prepare-bottom' : 'calendar__slide--prepare-top');

		// Подготовка следующего блока месяца
		if (nextMonthBlock) {
			nextMonthBlock.classList.add('user__month--prepare');
			void nextMonthBlock.offsetHeight; // reflow: браузер применяет opacity: 0 / blur до перехода
		}

		// Небольшая задержка для применения начальных стилей
		requestAnimationFrame(() => {
			// Убираем текущий слайд
			currentSlide.classList.add('calendar__slide--exit');
			currentSlide.classList.add(direction === 'next' ? 'calendar__slide--exit-top' : 'calendar__slide--exit-bottom');

			// Убираем текущий блок месяца
			if (currentMonthBlock) {
				currentMonthBlock.classList.add('user__month--exit');
			}

			// Показываем следующий слайд
			nextSlide.classList.remove('calendar__slide--prepare');
			nextSlide.classList.remove(direction === 'next' ? 'calendar__slide--prepare-bottom' : 'calendar__slide--prepare-top');
			nextSlide.classList.add('calendar__slide--active');

			// Показываем следующий блок месяца
			if (nextMonthBlock) {
				nextMonthBlock.classList.remove('user__month--prepare');
				nextMonthBlock.classList.add('user__month--active');
			}
		});

		// Очистка после завершения анимации
		setTimeout(() => {
			currentSlide.classList.remove('calendar__slide--active', 'calendar__slide--exit', 'calendar__slide--exit-top', 'calendar__slide--exit-bottom');
			currentSlide.setAttribute('aria-hidden', 'true');
			nextSlide.classList.remove('calendar__slide--prepare-top', 'calendar__slide--prepare-bottom');

			// Очистка блоков месяцев
			if (currentMonthBlock) {
				currentMonthBlock.classList.remove('user__month--active', 'user__month--exit');
			}
			if (nextMonthBlock) {
				nextMonthBlock.classList.remove('user__month--prepare');
			}

			this.currentIndex = targetIndex;
			this.isAnimating = false;

			this.updateButtonStates();
		}, 900); // Длительность анимации (900ms как у календаря)
	}

	updateSlides() {
		this.slides.forEach((slide, index) => {
			if (index === this.currentIndex) {
				slide.classList.add('calendar__slide--active');
				slide.setAttribute('aria-hidden', 'false');
			} else {
				slide.classList.remove('calendar__slide--active');
				slide.setAttribute('aria-hidden', 'true');
			}
		});

		this.updateButtonStates();
	}

	updateMonthBlocks() {
		this.monthBlocks.forEach((block, index) => {
			if (index === this.currentIndex) {
				block.classList.add('user__month--active');
			} else {
				block.classList.remove('user__month--active');
			}
		});
	}

	updateButtonStates() {
		// Можно добавить disabled состояние для кнопок на первом/последнем слайде
		// Или оставить циклическое переключение
	}

	handleTouchStart(e) {
		this.touchStartY = e.changedTouches[0].screenY;
	}

	handleTouchEnd(e) {
		this.touchEndY = e.changedTouches[0].screenY;
		this.handleSwipe();
	}

	handleSwipe() {
		const swipeThreshold = 50;
		const diff = this.touchStartY - this.touchEndY;

		if (Math.abs(diff) < swipeThreshold) return;

		if (diff > 0) {
			// Swipe up - next (снизу вверх)
			this.next();
		} else {
			// Swipe down - prev (сверху вниз)
			this.prev();
		}
	}
}

// Инициализация календаря
export function initCalendarSlider() {
	const calendar = document.querySelector('.calendar');
	if (calendar) {
		new CalendarSlider(calendar);
		console.log('Calendar slider initialized');
	}
}
