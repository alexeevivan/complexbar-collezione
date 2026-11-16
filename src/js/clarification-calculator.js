const MILK_RATIO = 0.375;
const volumeFormatter = new Intl.NumberFormat('ru-RU', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

export function initClarificationCalculator() {
	const calculator = document.querySelector('[data-clarification-calculator]');
	if (!calculator) return;

	const form = calculator.querySelector('[data-clarification-form]');
	const input = calculator.querySelector('[data-clarification-volume]');
	const output = calculator.querySelector('[data-clarification-output]');
	const error = calculator.querySelector('[data-clarification-error]');
	const resetButton = calculator.querySelector('[data-clarification-reset]');

	if (!form || !input || !output || !error || !resetButton) return;

	const renderResult = () => {
		const volume = input.value.trim() === '' ? 0 : input.valueAsNumber;
		const isInvalid = !Number.isFinite(volume) || volume < 0;

		input.setAttribute('aria-invalid', String(isInvalid));
		error.textContent = isInvalid ? 'Введите положительное число или ноль.' : '';
		output.value = volumeFormatter.format(isInvalid ? 0 : volume * MILK_RATIO);
	};

	input.addEventListener('input', renderResult);
	form.addEventListener('submit', (event) => event.preventDefault());
	resetButton.addEventListener('click', () => {
		input.value = '';
		renderResult();
		input.focus();
	});

	renderResult();
}
