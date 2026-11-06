import './styles/main.scss';
import './styles/recipes.scss';
import { initCardReveal } from './js/card-reveal.js';
import { initHeaderMenu } from './js/header-menu.js';
import { initHeaderScroll } from './js/header-scroll.js';
import { initRecipeCatalog } from './js/recipe-catalog.js';
import { initRecipeModal } from './js/recipe-modal.js';

document.addEventListener('DOMContentLoaded', () => {
	initHeaderMenu();
	initHeaderScroll();
	initRecipeCatalog();
	initCardReveal();
	initRecipeModal();
});
