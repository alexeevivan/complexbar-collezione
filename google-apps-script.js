const CONFIG = {
	// ID Google Sheets таблицы (из URL)
	SPREADSHEET_ID: '1GNOWlGoM5sbrKSvopmLZ4xetjxJQqwD09a6fESGzWnU',
	// Название листа в таблице
	SHEET_NAME: 'Registrations',
	// Настройки защиты от спама
	RATE_LIMIT: {
		// Лимит на одного клиента (clientId из localStorage браузера)
		MAX_REQUESTS_PER_MINUTE: 10,
		// Общий предохранитель на весь скрипт
		GLOBAL_MAX_REQUESTS_PER_MINUTE: 120,
		CACHE_DURATION: 60 // секунды
	},
	// Разрешенные мероприятия
	ALLOWED_EVENTS: [
		'october-event-1',
		'october-event-2',
		'november-event-1',
		'november-event-2',
		'december-event-1',
		'december-event-2'
	]
};

function doPost(e) {
	try {
		Logger.log('doPost called');

		// Парсинг данных
		let data;
		try {
			Logger.log('Parsing postData.contents: ' + e.postData.contents);
			data = JSON.parse(e.postData.contents);
			Logger.log('Parsed data: ' + JSON.stringify(data));
		} catch (parseError) {
			Logger.log('Parse error: ' + parseError.toString());
			return createResponse(false, 'Неверный формат данных');
		}

		// Проверка rate limiting: лимит на клиента + общий предохранитель
		Logger.log('Checking rate limit...');
		const clientId = data && typeof data === 'object' ? data.clientId : '';
		if (!checkRateLimit(clientId)) {
			return createResponse(false, 'Слишком много запросов. Попробуйте позже.');
		}

		// Валидация данных
		Logger.log('Validating data...');
		const validation = validateData(data);
		if (!validation.isValid) {
			Logger.log('Validation failed: ' + validation.message);
			return createResponse(false, validation.message);
		}
		Logger.log('Validation passed');

		// Проверка разрешенного мероприятия
		Logger.log('Checking allowed events...');
		if (!CONFIG.ALLOWED_EVENTS.includes(data.eventId)) {
			Logger.log('Event not allowed: ' + data.eventId);
			return createResponse(false, 'Мероприятие не найдено');
		}
		Logger.log('Event allowed');

		// Запись в Google Sheets
		Logger.log('Calling saveToSheet with data: ' + JSON.stringify(data));
		const result = saveToSheet(data);
		Logger.log('saveToSheet result: ' + JSON.stringify(result));

		// Проверка на дубликат
		if (!result.success) {
			return createResponse(false, result.message);
		}

		return createResponse(
			true,
			'Регистрация успешно оформлена',
			{ registrationId: result.registrationId }
		);
	} catch (error) {
		Logger.log('Error in doPost: ' + error.toString());
		Logger.log('Error stack: ' + error.stack);

		return createResponse(
			false,
			'Произошла ошибка при обработке заявки. Попробуйте позже.'
		);
	}
}

function doOptions() {
	// Apps Script не позволяет задавать произвольные CORS-заголовки:
	// их выставляет Google при редиректе на script.googleusercontent.com.
	// Клиент отправляет POST с Content-Type: text/plain, поэтому preflight
	// (OPTIONS) не выполняется вовсе. Функция оставлена как безопасный no-op.
	return createResponse(true, 'ok');
}

function validateData(data) {
	// Проверка обязательных полей
	if (!data || typeof data !== 'object') {
		return { isValid: false, message: 'Неверный формат данных' };
	}
	// Honeypot проверка - если поле website заполнено, это бот
	if (data.website && typeof data.website === 'string' && data.website.trim() !== '') {
		Logger.log('Bot detected via honeypot field');
		return { isValid: false, message: 'Ошибка валидации данных' };
	}
	// clientId приходит из localStorage браузера и используется для rate-limit
	if (data.clientId !== undefined && (typeof data.clientId !== 'string' || data.clientId.length > 64)) {
		return { isValid: false, message: 'Некорректный идентификатор клиента' };
	}
	// Проверка обязательных полей
	if (!data.eventId || typeof data.eventId !== 'string') {
		return { isValid: false, message: 'Event ID обязателен' };
	}
	if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
		return { isValid: false, message: 'Укажите имя и фамилию' };
	}

	if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 10) {
		return { isValid: false, message: 'Укажите корректный телефон' };
	}

	if (!data.email || typeof data.email !== 'string' || !isValidEmail(data.email)) {
		return { isValid: false, message: 'Укажите корректный email' };
	}

	// Проверка длины полей
	if (data.name.length > 100) {
		return { isValid: false, message: 'Имя слишком длинное' };
	}

	if (data.establishment && data.establishment.length > 200) {
		return { isValid: false, message: 'Название заведения слишком длинное' };
	}

	if (data.position && data.position.length > 100) {
		return { isValid: false, message: 'Название должности слишком длинное' };
	}

	return { isValid: true };
}

/**
 * Проверка формата email
 */
function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Защита от спама - Rate Limiting.
 * Apps Script не отдаёт IP клиента, поэтому лимит считается по clientId,
 * который фронтенд генерирует и хранит в localStorage. Дополнительно
 * действует общий лимит на весь скрипт.
 */
function checkRateLimit(clientId) {
	const cache = CacheService.getScriptCache();
	const clientKey = 'rate_limit_client_' + normalizeClientId(clientId);
	const globalKey = 'rate_limit_global';

	if (!incrementRateLimit(cache, globalKey, CONFIG.RATE_LIMIT.GLOBAL_MAX_REQUESTS_PER_MINUTE)) {
		return false;
	}

	return incrementRateLimit(cache, clientKey, CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE);
}

function incrementRateLimit(cache, key, max) {
	const currentCount = cache.get(key);
	const count = currentCount === null ? 0 : (parseInt(currentCount, 10) || 0);

	if (count >= max) {
		return false;
	}

	cache.put(key, String(count + 1), CONFIG.RATE_LIMIT.CACHE_DURATION);
	return true;
}

function normalizeClientId(clientId) {
	const normalized = String(clientId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
	return normalized || 'anonymous';
}

/**
 * Генерация уникального ID регистрации
 */
function generateRegistrationId() {
	const timestamp = new Date().getTime();
	const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
	return `REG-${timestamp}-${random}`;
}

/**
 * Сохранение данных в Google Sheets
 */
function saveToSheet(data) {
	try {
		Logger.log('saveToSheet called with data: ' + JSON.stringify(data));

		// Проверка данных
		if (!data || typeof data !== 'object') {
			Logger.log('Invalid data object');
			return {
				success: false,
				message: 'Неверный формат данных'
			};
		}

		Logger.log('Opening spreadsheet: ' + CONFIG.SPREADSHEET_ID);
		const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

		if (!spreadsheet) {
			Logger.log('Spreadsheet not found');
			return {
				success: false,
				message: 'Таблица не найдена'
			};
		}

		Logger.log('Getting sheet: ' + CONFIG.SHEET_NAME);
		const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

		if (!sheet) {
			Logger.log('Sheet not found: ' + CONFIG.SHEET_NAME);
			return {
				success: false,
				message: 'Лист "' + CONFIG.SHEET_NAME + '" не найден. Создайте лист с таким названием.'
			};
		}

		Logger.log('Sheet found, checking duplicates...');
		// Проверка дубликатов - в рамках мероприятия и выбранной даты
		const isDuplicate = checkDuplicateRegistration(
			sheet,
			data.eventId,
			data.eventDate,
			data.phone,
			data.email
		);
		if (isDuplicate.found) {
			Logger.log('Duplicate registration attempt: ' + isDuplicate.message);
			return {
				success: false,
				message: 'Участник с введенными выше данными уже зарегистрирован на выбранную дату'
			};
		}

		const registrationId = generateRegistrationId();
		const timestamp = new Date();

		Logger.log('Creating row for registration: ' + registrationId);

		// Подготовка строки для записи
		const row = [
			registrationId,                                           // Registration ID
			timestamp,                                                // Registration Date
			data.eventId,                                             // Event ID
			data.eventDate || '',                                     // Event Date (дата проведения мероприятия)
			data.name.trim(),                                         // Name
			data.establishment ? data.establishment.trim() : '',      // Establishment
			data.position ? data.position.trim() : '',                // Position
			data.phone.trim(),                                        // Phone
			data.email.trim(),                                        // Email
			'Новая'                                                   // Status
		];

		// Добавление строки в таблицу
		sheet.appendRow(row);

		Logger.log('Registration saved: ' + registrationId);

		return {
			success: true,
			registrationId: registrationId
		};

	} catch (error) {
		Logger.log('Error in saveToSheet: ' + error.toString());
		Logger.log('Error stack: ' + error.stack);
		return {
			success: false,
			message: 'Ошибка сохранения: ' + error.toString()
		};
	}
}

/**
 * Проверка дубликатов регистрации.
 * Проверяет только для конкретного мероприятия и конкретной даты.
 */
function checkDuplicateRegistration(sheet, eventId, eventDate, phone, email) {
	try {
		const data = sheet.getDataRange().getValues();
		const normalizedEventDate = normalizeEventDate(eventDate);

		// Пропускаем заголовок (первая строка)
		for (let i = 1; i < data.length; i++) {
			const row = data[i];
			const rowEventId = row[2];       // Event ID — колонка C (индекс 2)
			const rowEventDate = row[3];     // Event Date — колонка D (индекс 3)
			const rowPhone = row[7];         // Phone — колонка H (индекс 7)
			const rowEmail = row[8];         // Email — колонка I (индекс 8)

			// Проверяем только для текущего мероприятия и выбранной даты
			if (rowEventId !== eventId) continue;
			if (normalizeEventDate(rowEventDate) !== normalizedEventDate) continue;

			// Нормализуем телефон (удаляем все кроме цифр)
			const normalizedRowPhone = String(rowPhone).replace(/\D/g, '');
			const normalizedPhone = String(phone).replace(/\D/g, '');

			// Проверка по телефону
			if (normalizedRowPhone === normalizedPhone && normalizedPhone.length >= 10) {
				return {
					found: true,
					reason: 'phone',
					message: 'Этот номер телефона уже зарегистрирован на выбранную дату'
				};
			}

			// Проверка по email (case-insensitive)
			if (String(rowEmail).toLowerCase() === String(email).toLowerCase()) {
				return {
					found: true,
					reason: 'email',
					message: 'Этот email уже зарегистрирован на выбранную дату'
				};
			}
		}

		return { found: false };

	} catch (error) {
		Logger.log('Error in checkDuplicateRegistration: ' + error.toString());
		// В случае ошибки проверки - разрешаем регистрацию
		return { found: false };
	}
}

/**
 * Приводит дату мероприятия к единому виду.
 * Google Sheets может автоматически превратить строку в Date,
 * поэтому поддерживаем оба варианта.
 */
function normalizeEventDate(value) {
	if (value instanceof Date && !isNaN(value.getTime())) {
		return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd.MM.yyyy');
	}
	return String(value || '').trim();
}

/**
 * Создание JSON ответа.
 * ContentService не поддерживает произвольные HTTP-заголовки (включая CORS),
 * поэтому параметр headers убран: заголовки выставляет сам Google.
 */
function createResponse(success, message, additionalData = {}) {
	const response = {
		success: success,
		message: message,
		timestamp: new Date().toISOString(),
		...additionalData
	};

	return ContentService
		.createTextOutput(JSON.stringify(response))
		.setMimeType(ContentService.MimeType.JSON);
}

/**
 * Тестовая функция для проверки работы скрипта
 */
function testRegistration() {
	const testData = {
		eventId: 'october-event-1',
		eventDate: '27.10.2026',
		name: 'Иван Иванов',
		establishment: 'Test Bar',
		position: 'Бармен',
		phone: '+7 (999) 123-45-67',
		email: 'test@example.com',
		website: '' // Honeypot пустое
	};

	// Просто вызываем saveToSheet напрямую для теста
	Logger.log('Testing with data: ' + JSON.stringify(testData));
	const result = saveToSheet(testData);
	Logger.log('Test result: ' + JSON.stringify(result));

	return result;
}

/**
 * Тест полного потока через doPost
 */
function testRegistrationFull() {
	const testData = {
		eventId: 'october-event-1',
		eventDate: '27.10.2026',
		name: 'Иван Иванов',
		establishment: 'Test Bar',
		position: 'Бармен',
		phone: '+7 (999) 123-45-67',
		email: 'test@example.com',
		website: ''
	};

	const mockEvent = {
		postData: {
			contents: JSON.stringify(testData)
		}
	};

	const result = doPost(mockEvent);
	Logger.log('Full test result: ' + result.getContent());

	return result;
}
