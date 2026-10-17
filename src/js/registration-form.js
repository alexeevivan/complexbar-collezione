// Registration Form Handler
import { getEventConfig } from './events-config.js';

class RegistrationForm {
	constructor(formElement, eventId) {
		this.form = formElement;
		this.eventId = eventId;
		this.eventConfig = getEventConfig(eventId);
		this.isSubmitting = false;
		this.cooldownKey = 'registration_cooldown_' + this.eventId;
		this.selectedDate = null;

		this.elements = {
			name: this.form.querySelector('[name="name"]'),
			establishment: this.form.querySelector('[name="establishment"]'),
			position: this.form.querySelector('[name="position"]'),
			phone: this.form.querySelector('[name="phone"]'),
			email: this.form.querySelector('[name="email"]'),
			consent: this.form.querySelector('[name="consent"]'),
			honeypot: this.form.querySelector('[name="website"]'),
			submitBtn: this.form.querySelector('.form__submit'),
			successMessage: this.form.querySelector('.form__message--success'),
			errorMessage: this.form.querySelector('.form__message--error'),
			dateGroup: this.form.querySelector('.form__group--date-select'),
			dateOptions: this.form.querySelector('.form__date-options')
		};

		this.init();
	}

	init() {
		// Инициализация выбора даты
		this.initDateSelection();
		
		this.form.addEventListener('submit', (e) => this.handleSubmit(e));
		
		// Real-time validation
		this.elements.email.addEventListener('blur', () => this.validateEmail());
		this.elements.phone.addEventListener('blur', () => this.validatePhone());
		this.elements.name.addEventListener('blur', () => this.validateName());
		
		// Проверка cooldown при загрузке
		this.checkCooldown();
	}

	initDateSelection() {
		// Найти блок с датами мероприятия
		const userBlock = this.form.closest('.user__block');
		if (!userBlock) return;

		const courseDates = Array.from(userBlock.querySelectorAll('.user__course-date'));
		
		if (courseDates.length === 0) {
			// Нет дат - скрыть блок выбора
			this.elements.dateGroup.style.display = 'none';
			return;
		}

		if (courseDates.length === 1) {
			// Одна дата - автоматически выбираем её и скрываем блок выбора
			this.selectedDate = courseDates[0].textContent.trim();
			this.elements.dateGroup.style.display = 'none';
			return;
		}

		// Несколько дат - показываем выбор
		this.elements.dateGroup.style.display = 'block';
		this.elements.dateOptions.innerHTML = '';

		courseDates.forEach((dateElement, index) => {
			const date = dateElement.textContent.trim();
			const radioId = `date-${this.eventId}-${index}`;
			
			const label = document.createElement('label');
			label.className = 'form__radio';
			label.innerHTML = `
				<input type="radio" name="event-date-${this.eventId}" value="${date}" id="${radioId}" ${index === 0 ? 'checked' : ''} required />
				<span class="form__radio-text">${date}</span>
			`;
			
			this.elements.dateOptions.appendChild(label);
		});

		// Устанавливаем первую дату по умолчанию
		this.selectedDate = courseDates[0].textContent.trim();

		// Слушаем изменение выбора даты
		this.elements.dateOptions.addEventListener('change', (e) => {
			if (e.target.type === 'radio') {
				this.selectedDate = e.target.value;
			}
		});
	}

	checkCooldown() {
		const cooldownEnd = localStorage.getItem(this.cooldownKey);
		if (cooldownEnd) {
			const now = Date.now();
			const remainingTime = parseInt(cooldownEnd) - now;
			
			if (remainingTime > 0) {
				this.setCooldown(Math.ceil(remainingTime / 1000));
			}
		}
	}

	setCooldown(seconds) {
		this.elements.submitBtn.disabled = true;
		const originalText = this.elements.submitBtn.querySelector('.form__submit-text').textContent;
		
		const countdown = setInterval(() => {
			if (seconds <= 0) {
				clearInterval(countdown);
				this.elements.submitBtn.disabled = false;
				this.elements.submitBtn.querySelector('.form__submit-text').textContent = originalText;
				localStorage.removeItem(this.cooldownKey);
			} else {
				this.elements.submitBtn.querySelector('.form__submit-text').textContent = 
					`Подождите ${seconds} сек`;
				seconds--;
			}
		}, 1000);
	}

	validateName() {
		const name = this.elements.name.value.trim();
		const errorElement = this.elements.name.parentElement.querySelector('.form__error');

		if (!name) {
			this.showError(this.elements.name, errorElement, 'Пожалуйста, укажите имя и фамилию');
			return false;
		}

		if (name.length < 2) {
			this.showError(this.elements.name, errorElement, 'Имя слишком короткое');
			return false;
		}

		this.hideError(this.elements.name, errorElement);
		return true;
	}

	validateEmail() {
		const email = this.elements.email.value.trim();
		const errorElement = this.elements.email.parentElement.querySelector('.form__error');
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!email) {
			this.showError(this.elements.email, errorElement, 'Email обязателен для заполнения');
			return false;
		}

		if (!emailRegex.test(email)) {
			this.showError(this.elements.email, errorElement, 'Некорректный формат email');
			return false;
		}

		this.hideError(this.elements.email, errorElement);
		return true;
	}

	validatePhone() {
		const phone = this.elements.phone.value.trim();
		const errorElement = this.elements.phone.parentElement.querySelector('.form__error');
		// Простая проверка на наличие цифр (минимум 10)
		const digitsOnly = phone.replace(/\D/g, '');

		if (!phone) {
			this.showError(this.elements.phone, errorElement, 'Телефон обязателен для заполнения');
			return false;
		}

		if (digitsOnly.length < 10) {
			this.showError(this.elements.phone, errorElement, 'Некорректный номер телефона');
			return false;
		}

		this.hideError(this.elements.phone, errorElement);
		return true;
	}

	validateConsent() {
		const errorElement = this.elements.consent.closest('.form__group').querySelector('.form__error');
		
		if (!this.elements.consent.checked) {
			this.showError(this.elements.consent, errorElement, 'Необходимо согласие на обработку данных');
			return false;
		}

		this.hideError(this.elements.consent, errorElement);
		return true;
	}

	showError(input, errorElement, message) {
		if (errorElement) {
			input.classList.add('has-error');
			errorElement.textContent = message;
			errorElement.classList.add('is-visible');
		}
	}

	hideError(input, errorElement) {
		if (errorElement) {
			input.classList.remove('has-error');
			errorElement.textContent = '';
			errorElement.classList.remove('is-visible');
		}
	}

	hideAllMessages() {
		this.elements.successMessage.classList.remove('is-visible');
		this.elements.errorMessage.classList.remove('is-visible');
	}

	async handleSubmit(e) {
		e.preventDefault();

		// Prevent double submission
		if (this.isSubmitting) {
			return;
		}

		// Hide previous messages
		this.hideAllMessages();

		// Проверка honeypot (если заполнено - это бот)
		if (this.elements.honeypot && this.elements.honeypot.value !== '') {
			console.log('Bot detected via honeypot');
			this.showErrorMessage('Ошибка отправки формы');
			return;
		}

		// Validate all fields
		const isNameValid = this.validateName();
		const isEmailValid = this.validateEmail();
		const isPhoneValid = this.validatePhone();
		const isConsentValid = this.validateConsent();

		if (!isNameValid || !isEmailValid || !isPhoneValid || !isConsentValid) {
			return;
		}

		// Check if registration is enabled
		if (!this.eventConfig.registrationEnabled) {
			this.showErrorMessage('Регистрация на мероприятие временно недоступна');
			return;
		}

		// Check if Apps Script URL is configured
		if (!this.eventConfig.googleAppsScriptUrl || 
			this.eventConfig.googleAppsScriptUrl === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
			console.error('Google Apps Script URL не настроен');
			this.showErrorMessage('Регистрация временно недоступна. Обратитесь к администратору.');
			return;
		}

		// Prepare data
		const formData = {
			eventId: this.eventId,
			eventDate: this.selectedDate, // Выбранная дата мероприятия
			name: this.elements.name.value.trim(),
			establishment: this.elements.establishment.value.trim(),
			position: this.elements.position.value.trim(),
			phone: this.elements.phone.value.trim(),
			email: this.elements.email.value.trim(),
			website: this.elements.honeypot ? this.elements.honeypot.value : '' // Honeypot поле
		};

		// Submit
		await this.submitForm(formData);
	}

	async submitForm(data) {
		this.isSubmitting = true;
		this.setLoadingState(true);

		console.log('Submitting to:', this.eventConfig.googleAppsScriptUrl);
		console.log('Data:', data);

		try {
			const response = await fetch(this.eventConfig.googleAppsScriptUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data)
			});

			console.log('Response status:', response.status);
			console.log('Response type:', response.type);

			// Попытка прочитать JSON ответ
			const result = await response.json();
			console.log('Result:', result);

			if (result.success) {
				this.showSuccessMessage(result.message || 'Регистрация успешно оформлена!');
				this.resetForm();
				
				// Установка cooldown - 60 секунд
				const cooldownDuration = 60;
				const cooldownEnd = Date.now() + (cooldownDuration * 1000);
				localStorage.setItem(this.cooldownKey, cooldownEnd.toString());
				this.setCooldown(cooldownDuration);
			} else {
				// Показываем сообщение об ошибке от сервера
				this.showErrorMessage(result.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
			}
		} catch (error) {
			console.error('Registration error:', error);
			console.error('Error details:', {
				name: error.name,
				message: error.message,
				stack: error.stack
			});
			this.showErrorMessage('Произошла ошибка при отправке. Попробуйте ещё раз.');
		} finally {
			this.isSubmitting = false;
			this.setLoadingState(false);
		}
	}

	setLoadingState(isLoading) {
		if (isLoading) {
			this.elements.submitBtn.classList.add('is-loading');
			this.elements.submitBtn.disabled = true;
		} else {
			this.elements.submitBtn.classList.remove('is-loading');
			this.elements.submitBtn.disabled = false;
		}
	}

	showSuccessMessage(message) {
		const messageText = this.elements.successMessage.querySelector('span');
		if (messageText) {
			messageText.textContent = message;
		}
		this.elements.successMessage.classList.add('is-visible');
		
		// Scroll to message
		this.elements.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	showErrorMessage(message) {
		const messageText = this.elements.errorMessage.querySelector('span');
		if (messageText) {
			messageText.textContent = message;
		}
		this.elements.errorMessage.classList.add('is-visible');
		
		// Scroll to message
		this.elements.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	resetForm() {
		this.form.reset();
		
		// Remove all error states
		this.form.querySelectorAll('.has-error').forEach(el => {
			el.classList.remove('has-error');
		});
		
		this.form.querySelectorAll('.form__error.is-visible').forEach(el => {
			el.classList.remove('is-visible');
		});
	}
}

// Initialize all registration forms
export function initRegistrationForm() {
	const forms = document.querySelectorAll('.registration-form');
	if (forms.length > 0) {
		forms.forEach((form) => {
			const eventId = form.getAttribute('data-event-id');
			if (eventId) {
				new RegistrationForm(form, eventId);
				console.log('Registration form initialized for event:', eventId);
			}
		});
	}
}
