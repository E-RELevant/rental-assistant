// Elements
const elements = {
	selectLanguage: document.getElementById('select-language'),
	selectTheme: document.getElementById('select-theme'),
	intlCallCode: document.getElementById('intl-call-code'),
	patterns: document.getElementById('patterns'),
	btnAddPattern: document.getElementById('btn-add-pattern'),
	textboxPatternInput: document.getElementById('patterns-input'),
};

// Localization messages
i18nizer = {
	// <html-id>: <locales_message_key>
	'legend-visuals': 'options_legend_title_visuals',
	'visuals-option-theme': 'options_subtitle_theme',
	'dark-theme': 'options_theme_option_dark',
	'light-theme': 'options_theme_option_light',
	'legend-phone-number': 'options_legend_title_phone_number',
	'phone-number-option-intl-call-code': 'options_subtitle_intl_call_code',
	'phone-number-option-match-patterns': 'options_subtitle_match_patterns',
	'btn-add-pattern': 'options_button_add_pattern',
	'legend-domains': 'options_legend_title_domains',
	'domains-option-ingored-domains': 'options_subtitle_ignored_domains',
};

// Dynamic CSS
const popup_css = window.document.styleSheets[0];
const addCSS = (css) => popup_css.insertRule(css, popup_css.cssRules.length);

// init IntlTellInput
var iti = window.intlTelInput(elements.intlCallCode, {
	hiddenInput: 'tel',
	initialCountry: 'us',
	preferredCountries: ['us', 'il'],
});

document.addEventListener('DOMContentLoaded', async () => {
	// Settings
	settings = await updateLocales([
		'ignoredDomains',
		'regexPatterns',
		'selectedCountry',
		'theme',
	]);

	// Locales
	_updateLocaleElements(settings);
	elements.selectLanguage.value = settings.language;

	// Patterns
	for (var i = 0; i < settings.regexPatterns?.length; i++) {
		createNewPattern(patterns, settings.regexPatterns[i]);
	}

	// Theme
	elements.selectTheme.value = settings.theme;
	if (settings.theme == 'dark') {
		document.body.classList.add('dark');
	}

	elements.patterns.addEventListener('click', (event) => {
		// add a click event to the list container
		event.preventDefault();
		if (event.target.tagName === 'INPUT') {
			// the remove button received the click event...
			var data = event.target.parentNode.textContent;
			settings.regexPatterns.splice(settings.regexPatterns?.indexOf(data), 1);
			chrome.storage.local.set(
				{
					regexPatterns: settings.regexPatterns,
				},
				// now remove the item line.
				() => {
					event.target.parentNode.remove();
				},
			);

			settingsSavedToast();
		}
	});

	// 'Add' button
	elements.btnAddPattern.addEventListener('click', () => {
		var regex_pattern_text = elements.textboxPatternInput.value;
		if (settings.regexPatterns?.indexOf(regex_pattern_text) != -1) {
			return;
		}
		createNewPattern(elements.patterns, regex_pattern_text);

		// add new pattern to storage
		settings.regexPatterns.push(regex_pattern_text);
		chrome.storage.local.set({
			regexPatterns: settings.regexPatterns,
		});

		settingsSavedToast();
	});

	// 'Language' dropdown menu
	elements.selectLanguage.addEventListener('change', async (e) => {
		chrome.storage.local.set({
			language: e.target.value,
		});

		_updateLocaleElements(
			await updateLocales([
				'ignoredDomains',
				'regexPatterns',
				'selectedCountry',
			]),
		);

		settingsSavedToast();
	});

	// 'Theme' dropdown menu
	elements.selectTheme.addEventListener('change', async (e) => {
		chrome.storage.local.set({
			theme: e.target.value,
		});

		document.body.classList.toggle('dark');

		settingsSavedToast();
	});

	// 'International Calling Code' dropdown menu
	elements.intlCallCode.addEventListener('countrychange', function () {
		chrome.storage.local.set({
			selectedCountry: iti.getSelectedCountryData(),
		});

		settingsSavedToast();
	});
});

function _updateLocaleElements(settings) {
	// Direction
	var direction = getMessage('dir');
	addCSS(`body { direction: ${direction}; }`);

	// Elements contents
	iti.setCountry(settings.selectedCountry.iso2);
	elements.textboxPatternInput.placeholder = getMessage(
		'options_placeholder_patterns_input',
	);

	for (const [key, value] of Object.entries(i18nizer)) {
		document.getElementById(key).innerHTML = getMessage(value);
	}
}

function createNewPattern(list, regexPatternText) {
	if (!regexPatternText) return;

	// create a new list item
	const pattern = document.createElement('li');
	pattern.textContent = regexPatternText;
	pattern.className = 'patterns-item';

	if (regexPatternText !== phonePattern) {
		// create remove button
		const rmButton = document.createElement('input');
		rmButton.type = 'button';
		rmButton.name = 'btnDel';
		rmButton.value = 'X';

		pattern.appendChild(rmButton);
	}

	// add new pattern to the list
	list.appendChild(pattern);
}

function updateElements() {
	handleInput();
}

function settingsSavedToast() {
	Toastify({
		text: getMessage('options_saved_toast_text'),
		duration: 2000,
		gravity: 'bottom',
		position: getMessage('dir') == 'rtl' ? 'right' : 'left',
		close: true,
	}).showToast();
}
