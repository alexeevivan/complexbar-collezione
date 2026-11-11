// Чтобы добавить рецепт, вставьте новый объект в массив нужной коллекции.
// id должен быть уникальным для всего сайта.
// cardImage — изображение карточки, image — изображение внутри модального окна.
// alcoholic: true показывает бейдж «алк», false — «б/а».
export const recipeCollections = {
	'odk-syrup': [
		{
			id: 'k-roman',
			title: 'K & Roman',
			cardImage: 'assets/img/cocktails/odk-syrup/kroman.jpeg',
			image: 'assets/img/cocktails/odk-syrup/kroman-bottles.jpg',
			alcoholic: true,
			ingredients: [
				'30 мл - джин (предпочтителен Gin Mare)',
				'30 мл - вермут Martini Fiero',
				'30 мл - ODK Цветы Бузины',
				'30 мл - ODK Lime Premium Sour'
			],
			method: 'throwing',
			garnish: 'дегидрированная пудра из цедры апельсина и лайма'
		},
		{
			id: 'virginious-bana-bana',
			title: 'Virginious Bana-Bana',
			cardImage: 'assets/img/cocktails/odk-syrup/virgin-bana-bana.jpg',
			image: 'assets/img/cocktails/odk-syrup/virgin-bana-bana.jpg',
			alcoholic: false,
			ingredients: [
				'120 мл - Колд брю Ройбос (Ройбуш)',
				'30 мл - Pinch & Drop Пюре Банан',
				'25 мл - ODK Lime Premium Sour',
				'15 мл - ODK Ваниль'
			],
			method: 'pre-batched milk punch & build',
			garnish: 'отсутствует'
		},
		{
			id: 'blue-ice-latte',
			title: 'Blue Ice Latte',
			cardImage: 'assets/img/cocktails/odk-syrup/blue-ice-latte.jpg',
			image: 'assets/img/cocktails/odk-syrup/blue-ice-latte-modal.jpg',
			alcoholic: false,
			ingredients: [
				'80 мл - Молоко',
				'50 мл - Эспрессо-лунго',
				'40 мл - Смесь густых сливок и синей матчи',
				'15 мл - ODK Бобы тонка'
			],
			method: 'build',
			garnish: 'кофейные зёрна'
		},
		{
			id: 'rose-winter',
			title: 'Rose Winter',
			cardImage: 'assets/img/cocktails/odk-syrup/rose-winter.jpg',
			image: 'assets/img/cocktails/odk-syrup/rose-winter-modal.jpg',
			alcoholic: true,
			ingredients: [
				'40 мл - Бурбон',
				'20 мл - ODK Lemon Premium Sour',
				'15 мл - ODK Баббл-гам',
				'15 мл - ODK Розовый грейпфрут',
				'5 г - ODK Creamy Yogurt Frappè'
			],
			method: 'shake & double strain',
			garnish: 'Grainy Glaze малина & жареный панеттоне'
		},
		{
			id: 'fruity-spice-latte',
			title: 'Pumpkin Spice Latte',
			cardImage: 'assets/img/cocktails/odk-syrup/fruity-pumpkin-spice-latte.png',
			image: 'assets/img/cocktails/odk-syrup/fruity-pumpkin-spice-latte-modal.jpg',
			alcoholic: false,
			ingredients: [
				'120 мл - Молоко',
				'30 мл - ODK Fruity Mix на Ваш выбор',
				'25 мл - Молоко (для пены)',
				'15 мл - ODK Пряная тыква'
			],
			method: 'build & top-up (взбитое молоко с сиропом)',
			garnish: 'опционально - тыквенные чипсы'
		},
		{
			id: 'green-tower',
			title: 'Green Tower',
			cardImage: 'assets/img/cocktails/odk-syrup/green-tower.jpg',
			image: 'assets/img/cocktails/odk-syrup/green-tower.jpg',
			alcoholic: false,
			ingredients: [
				'20 мл - ODK Lime Premium Sour',
				'15 мл - ODK Солёная карамель',
				'25 мл - ODK Чай матча',
				'top-up - Тоник лимонный'
			],
			method: 'build',
			garnish: 'воздушная пена (ODK цветы бузины & Bubble drops)'
		},
		{
			id: 'moscow-blossom',
			title: 'Moscow Blossom',
			cardImage: 'assets/img/cocktails/odk-syrup/moscow-blossom.jpg',
			image: 'assets/img/cocktails/odk-syrup/moscow-blossom-modal.jpg',
			alcoholic: true,
			ingredients: [
				'30 мл - Джин',
				'30 мл - Водка',
				'30 мл - ODK Lime Premium Sour',
				'30 мл - ODK Огурец',
				'20 мл - ODK Жасмин'
			],
			method: 'shake & double strain',
			garnish: 'воздушная пена (Bubble drops) & слайс огурца'
		},
		{
			id: 'bana-bana',
			title: 'Bana-bana',
			cardImage: 'assets/img/cocktails/odk-syrup/bana-bana.jpg',
			image: 'assets/img/cocktails/odk-syrup/bana-bana.jpg',
			alcoholic: true,
			ingredients: [
				'100 мл - Virginious Bana-Bana',
				'45 мл - Ром тёмный',
				'3 дэш - Drinksome Cocoa Angobitter'
			],
			method: 'build',
			garnish: 'отсутствует'
		},
		{
			id: 'melony',
			title: 'Rosy Melony',
			cardImage: 'assets/img/cocktails/odk-syrup/melony.jpg',
			image: 'assets/img/cocktails/odk-syrup/melony.jpg',
			alcoholic: true,
			ingredients: [
				'60 мл - Джин',
				'30 мл - ODK Lime Premium Sour',
				'20 мл - ODK Арбуз',
				'6 капель - Bubble drops'
			],
			method: 'shake & double strain',
			garnish: 'сушёные лепестки роз'
		},
		{
			id: 'santas-pipe',
			title: "Santa's Pipe",
			cardImage: 'assets/img/cocktails/odk-syrup/santas-pipe.jpg',
			image: 'assets/img/cocktails/odk-syrup/santas-pipe.jpg',
			alcoholic: true,
			ingredients: [
				'45 мл - Джин',
				'60 мл - Сок апельсиновый (свежевыжатый)',
				'35 мл - ODK Панеттоне',
				'20 мл - ODK Lemon Premium Sour',
				'6 капель - Bubble drops'
			],
			method: 'shake & double strain',
			garnish: 'спрей saline solution (4:1)'
		}
	],
	'odk-puree': [],
	'pd-syrup': [],
	'pd-puree': [],
	'pd-drinkbase': [],
	code: [],
	osnova: [],
	drinksome: [],
	'bubble-drops': []
};

export const recipes = Object.fromEntries(
	Object.values(recipeCollections)
		.flat()
		.map((recipe) => [recipe.id, recipe])
);
