const SIMPLE_VARIANTS = {
	simple: { mark: '1:1', waterCoefficient: 1 },
	rich: { mark: '2:1', waterCoefficient: 0.5 },
	'semi-rich': { mark: '3:2', waterCoefficient: 2 / 3 },
	honey: { mark: '×0,64', waterCoefficient: 0.64 },
	agave: { mark: '×0,64', waterCoefficient: 0.64 }
};

const GINGER_INTENSITIES = [
	{ label: 'Мягкий', mark: 'M', juice: 0.103, sugarWater: 0.513, honeyWater: 0.362 },
	{ label: 'Средний', mark: 'MED', juice: 0.205, sugarWater: 0.410, honeyWater: 0.260 },
	{ label: 'Острый', mark: 'HOT', juice: 0.308, sugarWater: 0.308, honeyWater: 0.157 }
];

const MODE_CONFIG = {
	simple: {
		name: 'Базовый',
		inputLabel: 'Вес подсластителя',
		hint: 'Укажите вес сахара или другого подсластителя.',
		note: 'Смешайте все ингредиенты. При работе с мёдом не используйте воду горячее 60 °C. Для более длительного хранения сиропа агавы используйте дистиллированную воду.'
	},
	orgeat: {
		name: 'Ореховый орже',
		mark: '1:1',
		inputLabel: 'Вес орехового молока',
		hint: 'Укажите вес подготовленного орехового молока.',
		note: 'Для орехового молока измельчите орехи с водой в соотношении 1:3.'
	},
	ginger: {
		name: 'Имбирный сироп',
		inputLabel: 'Необходимое количество сиропа',
		hint: 'Укажите необходимое количество готового сиропа.',
		note: 'Смешайте подсластитель с кипятком. Получив однородную массу, добавьте имбирный сок и перемешайте.'
	},
	gomme: {
		name: 'Гомме-сироп',
		mark: 'GUM',
		inputLabel: 'Вес сахара',
		hint: 'Укажите вес сахара для приготовления гомме-сиропа.',
		note: 'Гидратируйте гуммиарабик в горячей воде и оставьте до 24 часов. В блендере растворите сахар в кипятке, затем добавьте раствор гуммиарабика и перемешайте ложкой.'
	}
};

const RESULT_KEYS = {
	simple: ['simple-water'],
	orgeat: ['orgeat-sugar', 'orgeat-gum', 'orgeat-xanthan', 'orgeat-blossom'],
	ginger: ['ginger-juice', 'ginger-water', 'ginger-sugar', 'ginger-honey'],
	gomme: ['gomme-gum', 'gomme-hydration-water', 'gomme-sugar-water']
};

const formatAmount = (value, digits = 2) => new Intl.NumberFormat('ru-RU', {
	minimumFractionDigits: digits,
	maximumFractionDigits: digits
}).format(value);

export function initSyrupCalculator() {
	const calculator = document.querySelector('[data-syrup-calculator]');
	if (!calculator) return;

	const tabs = [...calculator.querySelectorAll('[data-syrup-mode]')];
	const form = calculator.querySelector('[data-syrup-form]');
	const input = calculator.querySelector('[data-syrup-weight]');
	const modeName = calculator.querySelector('[data-syrup-mode-name]');
	const inputLabel = calculator.querySelector('[data-syrup-input-label]');
	const hint = calculator.querySelector('[data-syrup-hint]');
	const mark = calculator.querySelector('[data-syrup-mark]');
	const note = calculator.querySelector('[data-syrup-note]');
	const error = calculator.querySelector('[data-syrup-error]');
	const variantSelect = calculator.querySelector('[data-syrup-variant]');
	const customSelect = calculator.querySelector('[data-syrup-select]');
	const selectTrigger = calculator.querySelector('[data-syrup-select-trigger]');
	const selectValue = calculator.querySelector('[data-syrup-select-value]');
	const selectList = calculator.querySelector('[data-syrup-select-list]');
	const selectOptions = [...calculator.querySelectorAll('[data-syrup-option]')];
	const simpleOptions = calculator.querySelector('[data-simple-options]');
	const gingerOptions = calculator.querySelector('[data-ginger-options]');
	const intensityInput = calculator.querySelector('[data-ginger-intensity]');
	const honeyGingerInput = calculator.querySelector('[data-honey-ginger]');
	const resetButton = calculator.querySelector('[data-syrup-reset]');
	const resultRows = Object.fromEntries(
		[...calculator.querySelectorAll('[data-syrup-result]')].map((row) => [row.dataset.syrupResult, row])
	);
	const outputs = Object.fromEntries(
		[...calculator.querySelectorAll('[data-syrup-output]')].map((output) => [output.dataset.syrupOutput, output])
	);

	if (!tabs.length || !form || !input || !modeName || !inputLabel || !hint || !mark || !note || !error ||
		!variantSelect || !customSelect || !selectTrigger || !selectValue || !selectList || !selectOptions.length ||
		!simpleOptions || !gingerOptions || !intensityInput || !honeyGingerInput || !resetButton) return;

	let selectedMode = 'simple';

	const getWeight = () => input.value.trim() === '' ? 0 : input.valueAsNumber;

	const setOutput = (key, value, digits) => {
		outputs[key].value = formatAmount(value, digits);
	};

	const showModeResults = () => {
		Object.entries(resultRows).forEach(([key, row]) => {
			row.hidden = !RESULT_KEYS[selectedMode].includes(key);
		});
	};

	const getSelectedOption = () => selectOptions.find((option) => option.dataset.syrupOption === variantSelect.value);

	const closeVariantSelect = (focusTrigger = false) => {
		customSelect.classList.remove('is-open');
		selectTrigger.setAttribute('aria-expanded', 'false');
		selectList.setAttribute('aria-hidden', 'true');
		if (focusTrigger) selectTrigger.focus();
	};

	const openVariantSelect = (focusOption = true) => {
		customSelect.classList.add('is-open');
		selectTrigger.setAttribute('aria-expanded', 'true');
		selectList.setAttribute('aria-hidden', 'false');
		if (focusOption) getSelectedOption()?.focus();
	};

	const syncVariantSelect = () => {
		const selectedOption = getSelectedOption() || selectOptions[0];
		const optionName = selectedOption.querySelector('span')?.textContent.trim() || '';
		const optionRatio = selectedOption.querySelector('small')?.textContent.trim() || '';
		variantSelect.value = selectedOption.dataset.syrupOption;
		selectValue.textContent = optionRatio ? `${optionName} · ${optionRatio}` : optionName;
		selectOptions.forEach((option) => {
			const isSelected = option === selectedOption;
			option.classList.toggle('is-selected', isSelected);
			option.setAttribute('aria-selected', String(isSelected));
		});
	};

	const renderResults = () => {
		const weight = getWeight();
		const isInvalid = !Number.isFinite(weight) || weight < 0;
		const safeWeight = isInvalid ? 0 : weight;

		input.setAttribute('aria-invalid', String(isInvalid));
		error.textContent = isInvalid ? 'Введите положительное число или ноль.' : '';

		if (selectedMode === 'simple') {
			const variant = SIMPLE_VARIANTS[variantSelect.value];
			mark.textContent = variant.mark;
			setOutput('simple-water', safeWeight * variant.waterCoefficient, 0);
		}

		if (selectedMode === 'orgeat') {
			setOutput('orgeat-sugar', safeWeight, 0);
			setOutput('orgeat-gum', safeWeight * 0.003, 2);
			setOutput('orgeat-xanthan', safeWeight * 0.0008, 2);
			setOutput('orgeat-blossom', safeWeight * 0.002, 2);
		}

		if (selectedMode === 'ginger') {
			const intensity = GINGER_INTENSITIES[Number(intensityInput.value)];
			const isHoney = honeyGingerInput.checked;
			mark.textContent = intensity.mark;
			intensityInput.setAttribute('aria-valuenow', intensityInput.value);
			intensityInput.setAttribute('aria-valuetext', intensity.label);
			setOutput('ginger-juice', safeWeight * intensity.juice, 0);
			setOutput('ginger-water', safeWeight * (isHoney ? intensity.honeyWater : intensity.sugarWater), 0);
			setOutput('ginger-sugar', safeWeight * (isHoney ? 0 : 0.615), 0);
			setOutput('ginger-honey', safeWeight * (isHoney ? 0.726 : 0), 0);
		}

		if (selectedMode === 'gomme') {
			const gumArabic = safeWeight * 0.125;
			const hydrationWater = gumArabic / 0.9;
			setOutput('gomme-gum', gumArabic, 2);
			setOutput('gomme-hydration-water', hydrationWater, 0);
			setOutput('gomme-sugar-water', (safeWeight * 0.5) - hydrationWater, 0);
		}
	};

	const selectVariant = (value, focusTrigger = false) => {
		if (!SIMPLE_VARIANTS[value]) return;
		variantSelect.value = value;
		syncVariantSelect();
		closeVariantSelect(focusTrigger);
		renderResults();
	};

	const selectMode = (mode, focusTab = false) => {
		const config = MODE_CONFIG[mode];
		if (!config) return;

		selectedMode = mode;
		modeName.textContent = config.name;
		inputLabel.textContent = config.inputLabel;
		hint.textContent = config.hint;
		note.textContent = config.note;
		simpleOptions.hidden = mode !== 'simple';
		gingerOptions.hidden = mode !== 'ginger';
		mark.textContent = mode === 'simple'
			? SIMPLE_VARIANTS[variantSelect.value].mark
			: mode === 'ginger'
				? GINGER_INTENSITIES[Number(intensityInput.value)].mark
				: config.mark;

		tabs.forEach((tab) => {
			const isSelected = tab.dataset.syrupMode === mode;
			tab.classList.toggle('is-active', isSelected);
			tab.setAttribute('aria-selected', String(isSelected));
			tab.tabIndex = isSelected ? 0 : -1;
			if (isSelected && focusTab) tab.focus();
		});

		showModeResults();
		renderResults();
	};

	tabs.forEach((tab, index) => {
		tab.addEventListener('click', () => selectMode(tab.dataset.syrupMode));
		tab.addEventListener('keydown', (event) => {
			if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

			event.preventDefault();
			let nextIndex = index;
			if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
			if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
			if (event.key === 'Home') nextIndex = 0;
			if (event.key === 'End') nextIndex = tabs.length - 1;
			selectMode(tabs[nextIndex].dataset.syrupMode, true);
		});
	});

	input.addEventListener('input', renderResults);
	variantSelect.addEventListener('change', () => {
		syncVariantSelect();
		renderResults();
	});
	selectTrigger.addEventListener('click', () => {
		if (customSelect.classList.contains('is-open')) {
			closeVariantSelect();
		} else {
			openVariantSelect();
		}
	});
	selectTrigger.addEventListener('keydown', (event) => {
		if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;

		event.preventDefault();
		openVariantSelect();
		if (event.key === 'ArrowUp') selectOptions.at(-1).focus();
	});
	selectOptions.forEach((option, index) => {
		option.addEventListener('click', () => selectVariant(option.dataset.syrupOption, true));
		option.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closeVariantSelect(true);
				return;
			}

			if (event.key === 'Tab') {
				closeVariantSelect();
				return;
			}

			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				selectVariant(option.dataset.syrupOption, true);
				return;
			}

			if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

			event.preventDefault();
			let nextIndex = index;
			if (event.key === 'ArrowDown') nextIndex = (index + 1) % selectOptions.length;
			if (event.key === 'ArrowUp') nextIndex = (index - 1 + selectOptions.length) % selectOptions.length;
			if (event.key === 'Home') nextIndex = 0;
			if (event.key === 'End') nextIndex = selectOptions.length - 1;
			selectOptions[nextIndex].focus();
		});
	});
	document.addEventListener('pointerdown', (event) => {
		if (!customSelect.contains(event.target)) closeVariantSelect();
	});
	intensityInput.addEventListener('input', renderResults);
	honeyGingerInput.addEventListener('change', renderResults);
	form.addEventListener('submit', (event) => event.preventDefault());
	resetButton.addEventListener('click', () => {
		input.value = '';
		selectVariant('simple');
		intensityInput.value = '1';
		honeyGingerInput.checked = false;
		selectMode('simple');
		input.focus();
	});

	syncVariantSelect();
	selectMode('simple');
}
