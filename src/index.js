import './styles/main.scss';
import { initRegistrationForm } from './js/registration-form.js';
import { initCalendarSlider } from './js/calendar-slider.js';
import './js/calendar-page.js';

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
		body = document.body;

	if (!burger || !header) {
		console.error('burger/header не найдены', burger, header);
		return;
	}

	burger.addEventListener('click', function () {
		var isOpen = header.classList.toggle('menu-opened');
		burger.classList.toggle('active', isOpen);
		burger.classList.toggle('inverted', isOpen);
		body.classList.toggle('fixed', isOpen);
		console.log('menu open:', isOpen, burger.className);
	});
});