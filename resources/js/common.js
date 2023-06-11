// Version
const browserObj = typeof browser === 'undefined' ? chrome : browser;
const version = browserObj.runtime.getManifest().version;

//#region Constants
let settings = null;
let localeMessages = null;
let currentTheme = 'light';

const phonePattern =
	'(?:[\\s:]|\\d+(?:-|\\.)|^)\\(?(\\d{3})\\)?[- \\.]?(\\d{3})[- \\.]?(\\d{4})(?=<|\\s|$)';
const domainPattern =
	/^[?\w-]+:\/\/(?:www\.)?\[?(?<domain>[\w\.:]+)\]?(?::\d+)?/;
const domainRegex = new RegExp(domainPattern);

const contextMenuId = 'send_whatsapp';
//#endregion Constants

//#region i18n
async function loadLocaleMessagesFile(locale) {
	const localeFormatted = locale.replace('-', '_');
	const lang = localeFormatted.split('_')[0].toLowerCase();
	// const region = localeFormatted.split('_')[1];
	try {
		localeMessages = await _readMessagesFile(lang);
	} catch (error) {
		// always resolve
		console.warn(error);
		console.warn(`Language not found: ${lang}`);
	}
}

async function _readMessagesFile(locale) {
	const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
	const response = await _fetchJSON(url, { method: 'post' });
	return response;
}

async function _fetchJSON(url, options = {}) {
	if (options.method) options.method = options.method.toUpperCase();
	const response = await fetch(url, options);
	let responseData = await response.text();

	if (responseData) {
		try {
			responseData = JSON.parse(responseData);
		} catch (error) {
			console.warn('Response probably text only: ' + error);
		}
	}

	if (response.ok) {
		return responseData;
	} else {
		if (responseData) {
			if (typeof responseData.code === 'undefined') {
				responseData.code = response.status;
			} else {
				responseData.fetchReturnCode = response.status;
			}
			throw responseData;
		} else {
			throw response.statusText;
		}
	}
}

function getMessage(messageID) {
	if (!messageID) return;
	if (!localeMessages) {
		// use default language
		return chrome.i18n.getMessage(messageID);
	}

	// message found in this language
	const messageObj = localeMessages[messageID];
	if (!messageObj) {
		return chrome.i18n.getMessage(messageID);
	}

	// patch: replace escaped $$ to just $ (because chrome.i18n.getMessage did it automatically)
	let str = messageObj.message;
	if (str) str = str.replace(/\$\$/g, '$');
	return str;
}

async function updateLocales(storageSettingsArray) {
	settings = await new Promise((resolve) => {
		if (!storageSettingsArray.includes('language'))
			storageSettingsArray.push('language');
		chrome.storage.local.get(storageSettingsArray, resolve);
	});

	// Load locale messages file
	if (!settings.language || settings.language === '') {
		settings.language = 'en';
	}
	await loadLocaleMessagesFile(settings.language);

	// Update context menu title
	chrome.contextMenus.update(contextMenuId, {
		title: getMessage('context_menu_title'),
	});

	return settings;
}
//#endregion i18n

//#region Tags
function replaceMessageTags(settings) {
	const tagsMap = {
		[`@${getMessage('popup_tag_website')}`]: settings.domain,
		[`@${getMessage('popup_tag_greeting')}`]: greetingByHour(
			settings.currentHour,
		),
		[`@${getMessage('popup_tag_name')}`]: settings.sender,
	};

	const regex = new RegExp(Object.keys(tagsMap).join('|'), 'gi');
	return settings.message.replace(regex, (matched) => tagsMap[matched]);

	return message;
}

function greetingByHour(hour) {
	if (hour >= 1 && hour < 12) {
		return getMessage('greeting_morning');
	} else if (hour >= 12 && hour < 16) {
		return getMessage('greeting_midday');
	} else if (hour >= 16 && hour < 19) {
		return getMessage('greeting_afternoon');
	} else if (hour >= 19 && hour < 21) {
		return getMessage('greeting_evening');
	} else {
		return getMessage('greeting_night');
	}
}
//#endregion Tags

function createWhatsAppAPILink(settings, matchGroups) {
	var formattedPhoneNumber = [
		settings.selectedCountry.dialCode,
		matchGroups[1].length == 3 ? matchGroups[1].substring(1) : matchGroups[1],
		matchGroups[2],
		matchGroups[3],
	].join('');
	var message = encodeURIComponent(replaceMessageTags(settings));

	return `https://wa.me/${formattedPhoneNumber}?text=${message}`;
}
