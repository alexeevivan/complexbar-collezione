// Events Configuration
// Конфигурация мероприятий и привязка к Google Sheets

export const EVENTS_CONFIG = {
	'october-event-1': {
		eventId: 'october-event-1',
		title: 'ODK. Презентация продуктов',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	},
	'october-event-2': {
		eventId: 'october-event-2',
		title: 'Напитки. И как их смешивать',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	},
	'november-event-1': {
		eventId: 'november-event-1',
		title: 'Зимние напитки в меню',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	},
	'november-event-2': {
		eventId: 'november-event-2',
		title: 'Современный бар как твист на классику смешанного мира',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	},
	'december-event-1': {
		eventId: 'december-event-1',
		title: 'Pinch & Drop. Презентация продуктов',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	},
	'december-event-2': {
		eventId: 'december-event-2',
		title: 'Современный бар как система. Автоматизация и стандартизация процессов',
		registrationEnabled: true,
		googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbza-g8Rh1OQZlhZ3Yl1dC1LTaemgsWHTY5HlSrs5QZUi7KHQveqhwRUwQJvAFphN1S5aA/exec'
	}
};

// Получить конфигурацию по ID мероприятия
export function getEventConfig(eventId) {
	return EVENTS_CONFIG[eventId] || null;
}

// Получить конфигурацию текущего мероприятия (по умолчанию первое)
export function getCurrentEventConfig() {
	return EVENTS_CONFIG['october-event-1'];
}

