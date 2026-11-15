const CITRUS_CONFIG = {
	lemon: {
		name: 'Лимон',
		inputLabel: 'Вес цедры',
		hint: 'Взвесьте только тонко снятую цедру без белой части.',
		coefficients: { citric: 1, malic: 0, water: 16.66 }
	},
	lime: {
		name: 'Лайм',
		inputLabel: 'Вес цедры',
		hint: 'Взвесьте только тонко снятую цедру без белой части.',
		coefficients: { citric: 0.66666, malic: 0.333, water: 16.66 }
	},
	orange: {
		name: 'Апельсин',
		inputLabel: 'Вес цедры',
		hint: 'Взвесьте только тонко снятую цедру без белой части.',
		coefficients: { citric: 0.9, malic: 0.1, water: 16.66 }
	},
	grapefruit: {
		name: 'Грейпфрут',
		inputLabel: 'Вес цедры',
		hint: 'Взвесьте только тонко снятую цедру без белой части.',
		coefficients: { citric: 0.8, malic: 0.2, msg: 0.0333, water: 16.66 }
	},
	kumquat: {
		name: 'Кумкват',
		inputLabel: 'Вес целых плодов',
		hint: 'Для кумквата взвесьте целые плоды, а не только цедру.',
		coefficients: { citric: 0.25, ascorbic: 0.002, water: 4.165 }
	}
};

const RESULT_KEYS = ['citric', 'malic', 'ascorbic', 'msg', 'water'];
const amountFormatter = new Intl.NumberFormat('ru-RU', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

function getWeight(input) {
	if (input.value.trim() === '') return 0;
	return input.valueAsNumber;
}

function calculate(weight, coefficients) {
	return Object.fromEntries(
		Object.entries(coefficients).map(([key, coefficient]) => [key, weight * coefficient])
	);
}

export function initSuperjuiceCalculator() {
	const calculator = document.querySelector('[data-superjuice-calculator]');
	if (!calculator) return;

	const tabs = [...calculator.querySelectorAll('[data-citrus]')];
	const input = calculator.querySelector('#superjuice-weight');
	const form = calculator.querySelector('.superjuice-calculator__form');
	const citrusName = calculator.querySelector('[data-citrus-name]');
	const weightLabel = calculator.querySelector('[data-weight-label]');
	const weightHint = calculator.querySelector('[data-weight-hint]');
	const error = calculator.querySelector('[data-calculator-error]');
	const resetButton = calculator.querySelector('[data-calculator-reset]');
	const resultRows = Object.fromEntries(
		RESULT_KEYS.map((key) => [key, calculator.querySelector(`[data-result="${key}"]`)])
	);
	const outputs = Object.fromEntries(
		RESULT_KEYS.map((key) => [key, calculator.querySelector(`[data-output="${key}"]`)])
	);

	if (!input || !form || !citrusName || !weightLabel || !weightHint || !error || !resetButton) return;

	let selectedCitrus = 'lemon';

	const renderResults = () => {
		const config = CITRUS_CONFIG[selectedCitrus];
		const weight = getWeight(input);
		const isInvalid = !Number.isFinite(weight) || weight < 0;

		input.setAttribute('aria-invalid', String(isInvalid));
		error.textContent = isInvalid ? 'Введите положительное число или ноль.' : '';

		const results = calculate(isInvalid ? 0 : weight, config.coefficients);

		RESULT_KEYS.forEach((key) => {
			const isUsed = Object.hasOwn(config.coefficients, key);
			resultRows[key].hidden = !isUsed;
			outputs[key].value = amountFormatter.format(results[key] ?? 0);
		});
	};

	const selectCitrus = (citrus, focusTab = false) => {
		const config = CITRUS_CONFIG[citrus];
		if (!config) return;

		selectedCitrus = citrus;
		citrusName.textContent = config.name;
		weightLabel.textContent = config.inputLabel;
		weightHint.textContent = config.hint;

		tabs.forEach((tab) => {
			const isSelected = tab.dataset.citrus === citrus;
			tab.classList.toggle('is-active', isSelected);
			tab.setAttribute('aria-selected', String(isSelected));
			tab.tabIndex = isSelected ? 0 : -1;
			if (isSelected && focusTab) tab.focus();
		});

		renderResults();
	};

	tabs.forEach((tab, index) => {
		tab.addEventListener('click', () => selectCitrus(tab.dataset.citrus));
		tab.addEventListener('keydown', (event) => {
			if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

			event.preventDefault();
			let nextIndex = index;
			if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
			if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
			if (event.key === 'Home') nextIndex = 0;
			if (event.key === 'End') nextIndex = tabs.length - 1;

			selectCitrus(tabs[nextIndex].dataset.citrus, true);
		});
	});

	input.addEventListener('input', renderResults);
	form.addEventListener('submit', (event) => event.preventDefault());
	resetButton.addEventListener('click', () => {
		input.value = '';
		selectCitrus('lemon');
		input.focus();
	});

	renderResults();
}
