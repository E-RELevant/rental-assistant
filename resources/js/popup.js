// Elements
const elements = {
	titleSender: document.getElementById('sender-title'),
	textboxSender: document.getElementById('sender'),
	titleMessage: document.getElementById('message-title'),
	textboxMessage: document.getElementById('message'),
	buttonSave: document.getElementById('btn-save'),
	themeToggle: document.getElementById('theme-toggle'),
	options: document.getElementById('options'),
};

// Dynamic CSS
const popup_css = window.document.styleSheets[0];
const addCSS = (css) => popup_css.insertRule(css, popup_css.cssRules.length);

const themeCSS = {
	dark: '.theme-toggle:checked + .theme-toggle-label .ball { transform: translateX(-24px); }',
	light:
		'.theme-toggle:checked + .theme-toggle-label .ball { transform: translateX(24px); }',
};

// Tags Highlighting
const $backdrop = $('.backdrop');
const $highlights = $('.highlights');
const $textarea = $('#message');

// Entry point (load the settings because there is not a way to do this synchronously)
document.addEventListener('DOMContentLoaded', async () => {
	// Version
	document.getElementById('version').textContent = 'v' + version;

	// Settings
	settings = await updateLocales(['language', 'sender', 'message', 'theme']);

	// Settings: Message
	if (!settings.message || settings.message.length === 0) {
		settings.message = await getMessage('popup_default_message');
	}

	// Settings: Theme
	addCSS(themeCSS[settings.theme]);
	if (settings.theme === 'dark') {
		document.body.classList.add('dark');
		addCSS('.ball { left: 26px !important; }');
	}

	// Locales
	_updateLocaleElements(settings);

	// 'Message' textarea
	messageTextareaBindEvents();

	// 'Theme' switch
	elements.themeToggle.addEventListener('change', () => {
		document.body.classList.toggle('dark');

		if (document.body.classList.contains('dark')) {
			currentTheme = 'dark';
		} else {
			currentTheme = 'light';
		}

		chrome.storage.local.set({
			theme: currentTheme,
		});
	});

	// 'Options' button
	elements.options.addEventListener('click', function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	});

	// 'Save' button
	elements.buttonSave.addEventListener('click', function () {
		chrome.storage.local.set(
			{
				sender: elements.textboxSender.value,
				message: elements.textboxMessage.value,
			},
			function () {
				chrome.tabs.query(
					{
						active: true,
						currentWindow: true,
					},
					function (arrayOfTabs) {
						chrome.tabs.reload(arrayOfTabs[0].id);
					},
				);
			},
		);
	});
});

//#region 'Message' textarea highlighting
function messageTextareaBindEvents() {
	$textarea.on({
		input: messageTextareaHandleInput,
		scroll: messageTextareaHandleScroll,
	});
}

function messageTextareaHandleInput() {
	var text = $textarea.val();
	var highlightedText = messageTextareaApplyHighlights(text);
	$highlights.html(highlightedText);
}

function messageTextareaApplyHighlights(text) {
	// /@+[\p{L}_]{1,}/g // No support for \p{L} in JavaScript regex
	text = text
		.replace(/\n$/g, '\n\n')
		.replace(/@+[A-zא-ת]{1,}/g, '<mark>$&</mark>');
	return text;
}

function messageTextareaHandleScroll() {
	var scrollTop = $textarea.scrollTop();
	$backdrop.scrollTop(scrollTop);
}
//#endregion 'Message' textarea highlighting

function _updateLocaleElements(settings) {
	// Direction
	const direction = getMessage('dir');
	addCSS(`.modal { direction: ${direction}; }`);

	// Elements contents
	elements.titleSender.innerHTML = getMessage('popup_title_sender') + ':';
	elements.textboxSender.placeholder = getMessage('popup_placeholder_sender');
	if ('sender' in settings) elements.textboxSender.value = settings.sender;

	elements.titleMessage.innerHTML = getMessage('popup_title_message') + ':';
	elements.textboxMessage.placeholder = getMessage('popup_placeholder_message');
	if ('message' in settings) elements.textboxMessage.value = settings.message;

	elements.buttonSave.innerHTML = getMessage('popup_button_save');

	messageTextareaHandleInput();
}
