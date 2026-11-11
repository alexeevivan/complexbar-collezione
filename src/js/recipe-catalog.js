import { recipeCollections } from './recipes-data.js';

export function createRecipeCard(recipe) {
	const item = document.createElement('div');
	item.className = 'card-container__item';

	const link = document.createElement('a');
	link.href = `#${recipe.id}`;
	link.className = 'recipe-trigger';
	link.dataset.recipeId = recipe.id;
	link.setAttribute('aria-haspopup', 'dialog');

	const pictureWrap = document.createElement('div');
	pictureWrap.className = 'card-container__picture';

	const picture = document.createElement('picture');
	const image = document.createElement('img');
	image.src = recipe.cardImage || recipe.image;
	image.alt = recipe.title;
	image.loading = 'lazy';
	image.width = 400;
	image.height = 500;

	picture.appendChild(image);
	pictureWrap.appendChild(picture);

	const name = document.createElement('div');
	name.className = 'card-container__name';

	const spacer = document.createElement('span');
	spacer.className = 'empty';

	const title = document.createElement('span');
	title.textContent = recipe.title;

	const badge = document.createElement('span');
	badge.className = recipe.alcoholic ? 'badge-alcohol' : 'badge-non-alcohol';
	badge.textContent = recipe.alcoholic ? 'алк' : 'б/а';

	name.append(spacer, title, badge);
	link.append(pictureWrap, name);
	item.appendChild(link);

	return item;
}

export function renderRecipeCards(container, collection, emptyMessage = 'Рецепты скоро появятся') {
	if (collection.length === 0) {
		const message = document.createElement('p');
		message.className = 'card-container__empty';
		message.textContent = emptyMessage;
		container.replaceChildren(message);
		return;
	}

	container.replaceChildren(...collection.map(createRecipeCard));
}

export function initRecipeCatalog() {
	const container = document.querySelector('[data-recipe-collection]');
	if (!container) return null;

	const collectionId = container.dataset.recipeCollection;
	const collection = recipeCollections[collectionId] || [];

	renderRecipeCards(container, collection);
	return { container, collection };
}
