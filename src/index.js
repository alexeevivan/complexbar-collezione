import './styles/main.scss';
import $ from 'jquery';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { initRegistrationForm } from './js/registration-form.js';
import { initCalendarSlider } from './js/calendar-slider.js';
import { initCardReveal } from './js/card-reveal.js';
import { initHeaderScroll } from './js/header-scroll.js';
import './js/swiper-slider.js';

// Recipes Cocktail Cards Reveal
$(document).ready(function () {
	initRegistrationForm();
	initCalendarSlider();
	initCardReveal();
	initHeaderScroll();
});

// -- Slider

$('.slide-nav').on('click', function (e) {
	e.preventDefault();
	// get current slide
	var current = $('.flex--active').data('slide'),
		// get button data-slide
		next = $(this).data('slide');

	$('.slide-nav').removeClass('active');
	$(this).addClass('active');

	if (current === next) {
		return false;
	} else {
		$('.slider__wrapper').find('.flex__container[data-slide=' + next + ']').addClass('flex--preStart');
		$('.flex--active').addClass('animate--end');
		setTimeout(function () {
			$('.flex--preStart').removeClass('animate--start flex--preStart').addClass('flex--active');
			$('.animate--end').addClass('animate--start').removeClass('animate--end flex--active');
		}, 800);
	}
});

// -- Toggle Content

$('.hidden-content').on('click', function (e) {
	e.preventDefault();
	const $content = $('.content');
	const $button = $(this);
	const $divider = $('.bottom-divider');

	// Сохраняем текущий текст
	const currentText = $button.text().trim();
	const newText = $content.hasClass('is-visible') ? 'Эксклюзивные рецепты' : 'Коллекция рецептур';

	// Если текст отличается, применяем blur-эффект
	if (currentText !== newText) {
		// Добавляем blur
		$button.addClass('is-changing');

		// Меняем текст в середине анимации
		setTimeout(function () {
			$button.text(newText);
		}, 150);

		// Убираем blur
		setTimeout(function () {
			$button.removeClass('is-changing');
		}, 300);
	}

	$content.toggleClass('is-visible');
	$button.toggleClass('is-expanded');
	$divider.toggleClass('has-spacing');
});

// -- Initialize Registration Form
$(document).ready(function () {
	initRegistrationForm();
	initCalendarSlider();
});

// -- Burger

document.addEventListener('DOMContentLoaded', function () {
	var burger = document.querySelector('.burger'),
		header = document.querySelector('.header'),
		body = document.body,
		lockedScrollY = 0;

	if (!burger || !header) {
		console.error('burger/header не найдены', burger, header);
		return;
	}

	function lockScroll() {
		lockedScrollY = window.scrollY;
		body.style.top = '-' + lockedScrollY + 'px';
		body.classList.add('fixed');
	}

	function unlockScroll() {
		body.classList.remove('fixed');
		body.style.top = '';
		// behavior: 'instant' — чтобы не было плавной прокрутки, если у html есть scroll-behavior: smooth
		window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' });
	}

	burger.addEventListener('click', function () {
		var isOpen = header.classList.toggle('menu-opened');
		burger.classList.toggle('active', isOpen);
		burger.classList.toggle('inverted', isOpen);

		if (isOpen) {
			lockScroll();
		} else {
			unlockScroll();
		}
	});
});