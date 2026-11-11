import { renderRecipeCards } from './recipe-catalog.js';

function normalizeSearchText(value) {
	return value
		.toLocaleLowerCase('ru-RU')
		.normalize('NFKC')
		.replaceAll('ё', 'е')
		.trim();
}

function getIngredientName(ingredient) {
	const separator = ' - ';
	const separatorIndex = ingredient.indexOf(separator);

	return separatorIndex === -1
		? ingredient
		: ingredient.slice(separatorIndex + separator.length);
}

function recipeMatches(recipe, query) {
	const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
	if (terms.length === 0) return true;

	const ingredientNames = recipe.ingredients.map(getIngredientName).join(' ');
	const ingredients = normalizeSearchText(ingredientNames);
	return terms.every((term) => ingredients.includes(term));
}

export function initRecipeSearch({ container, collection, onResultsChange }) {
	const form = document.querySelector('[data-recipe-search-form]');
	const input = document.querySelector('[data-recipe-search]');
	const status = document.querySelector('[data-recipe-search-status]');
	const suggestions = document.querySelectorAll('[data-search-suggestion]');

	if (!form || !input || !status) return;

	const applySearch = () => {
		const query = input.value.trim();
		const matches = collection.filter((recipe) => recipeMatches(recipe, query));
		const emptyMessage = query
			? `По запросу «${query}» ничего не найдено`
			: 'Рецепты скоро появятся';

		renderRecipeCards(container, matches, emptyMessage);

		if (query) {
			status.textContent = `Найдено рецептов: ${matches.length}`;
		} else {
			status.textContent = '';
		}

		onResultsChange();
	};

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		applySearch();
	});

	input.addEventListener('input', applySearch);

	suggestions.forEach((suggestion) => {
		const suggestionValue = suggestion.dataset.searchSuggestion;
		const isRelevant = collection.some((recipe) => recipeMatches(recipe, suggestionValue));
		suggestion.hidden = !isRelevant;

		suggestion.addEventListener('click', () => {
			input.value = suggestionValue;
			applySearch();
			input.focus();
		});
	});
}
