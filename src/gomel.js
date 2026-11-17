import './styles/main.scss';
import './styles/recipes.scss';
import { initRegistrationForm } from './js/registration-form.js';
import { initHeaderMenu } from './js/header-menu.js';
import { initHeaderScroll } from './js/header-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
	initRegistrationForm();
	initHeaderMenu();
	initHeaderScroll();
});
