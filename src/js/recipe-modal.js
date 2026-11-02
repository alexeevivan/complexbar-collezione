import { recipes } from './recipes-data.js';

export function initRecipeModal() {
	const dialog = document.querySelector('[data-recipe-modal]');
	if (!dialog) return;

	const el = {
		title: dialog.querySelector('[data-recipe-title]'),
		image: dialog.querySelector('[data-recipe-image]'),
		ingredients: dialog.querySelector('[data-recipe-ingredients]'),
		method: dialog.querySelector('[data-recipe-method]'),
		garnish: dialog.querySelector('[data-recipe-garnish]'),
		content: dialog.querySelector('.recipe-modal__content'),
	};

	function fillModal(recipe) {
		// textContent (а не innerHTML) — защита от внедрения разметки из данных
		el.title.textContent = recipe.title;
		el.image.src = recipe.image;
		el.image.alt = recipe.title;
		el.method.textContent = recipe.method;
		el.garnish.textContent = recipe.garnish;

		el.ingredients.replaceChildren(
			...recipe.ingredients.map((text) => {
				const item = document.createElement('li');
				item.textContent = text;
				return item;
			})
		);
	}

	// Открытие: делегирование на документе, карточки можно добавлять и убирать свободно
	document.addEventListener('click', (event) => {
		const trigger = event.target.closest('.recipe-trigger');
		if (!trigger) return;

		event.preventDefault();

		const recipeId = trigger.dataset.recipeId;

		// Object.hasOwn: recipes['constructor'] и подобные ключи не должны считаться рецептами
		if (!Object.hasOwn(recipes, recipeId)) {
			console.warn(`Рецепт "${recipeId}" не найден`);
			return;
		}

		fillModal(recipes[recipeId]);
		dialog.showModal();
		// при открытии другого рецепта начинаем с начала, а не с прежней позиции прокрутки
		if (el.content) el.content.scrollTop = 0;
	});

	// Закрытие: по клику на затемнение и по кнопке с атрибутом data-recipe-close
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog || event.target.closest('[data-recipe-close]')) {
			dialog.close();
		}
	});
}