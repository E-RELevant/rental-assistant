importScripts('./resources/js/common.js');

chrome.runtime.onInstalled.addListener(function () {
	chrome.storage.local.set({
		ignoredDomains: [],
		selectedCountry: { name: 'United States', iso2: 'us', dialCode: '1' },
		language: 'en',
		message: '',
		theme: 'dark',
		regexPatterns: [phonePattern],
		sender: '',
	});

	chrome.contextMenus.create({
		id: contextMenuId,
		title: 'Send a WhatsApp message',
		contexts: ['selection'],
	});

	console.log('Extension installed; Default settings saved.');
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (info.menuItemId !== contextMenuId) return;
	let selectedText = info.selectionText;

	settings = await updateLocales(['message', 'regexPatterns']);

	// Update existing settings
	if (!settings.message) {
		settings.message = getMessage('popup_default_message');
	}

	// Add custom settings (tags)
	settings.domain = tab.url.match(domainRegex)[1];
	settings.currentHour = new Date().getHours();

	for (let i = 0; i < settings.regexPatterns.length; i++) {
		let telRegex = new RegExp(settings.regexPatterns[i], 'g');
		if (telRegex.test(selectedText)) {
			let matches = selectedText.match(telRegex);
			let matchGroups = telRegex.exec(matches);

			let whatsappLink = createWhatsAppAPILink(settings, matchGroups);

			chrome.tabs.create({
				url: whatsappLink,
			});
			return;
		}
	}
});
