var detectedNumberClassName = 'detectedNumber';
var filteredTagNames = [
	'SCRIPT',
	'STYLE',
	'BUTTON',
	'HEAD',
	'TITLE',
	'JSL',
	'NOSCRIPT',
];

// entry point (load the settings because there is not a way to do this synchronously)
chrome.storage.local.get(
	[
		'ignoredDomains',
		'selectedCountry',
		'language',
		'message',
		'regexPatterns',
		'sender',
	],
	async function (scopedSettings) {
		settings = scopedSettings;
		// Language
		if (settings.language == '') {
			settings.language = 'en';
		}
		await loadLocaleMessagesFile(settings.language);

		// Update existing settings
		if (!settings.message) {
			settings.message = getMessage('popup_default_message');
		}

		// Add custom settings (tags)
		settings.domain = encodeURI(window.top.location.href.match(domainRegex)[1]);
		settings.currentHour = new Date().getHours();

		if (settings.regexPatterns.length == 0) return;

		var mutationObserver = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type == 'childList') {
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						if (mutation.addedNodes[i].className != detectedNumberClassName) {
							walkTheDOM(mutation.addedNodes[i], handleNode);
						}
					}
				}
			});
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});

		// inserting on idle, so the DOM may or may not have already been loaded
		if (document.readyState == 'loading')
			document.addEventListener('DOMContentLoaded', function () {
				walkTheDOM(document.body, handleNode);
			});
		else walkTheDOM(document.body, handleNode);
	},
);

function handleNode(node) {
	// updated this so that we no longer override things inside of scripts nodes
	// (stupid that these are counted as visible text, but there it is)
	if (
		node.nodeType != Node.TEXT_NODE ||
		node.parentElement == null ||
		filteredTagNames.indexOf(node.parentElement.tagName) > -1 ||
		node.parentElement.tagName == 'A'
	)
		return;

	if (node.parentNode.className == detectedNumberClassName)
		// avoid the stack overflow
		return;

	// iterate through each regex pattern
	for (var i = 0; i < settings.regexPatterns.length; i++) {
		var telRegex = new RegExp(settings.regexPatterns[i], 'g');
		if (!telRegex.test(node.data)) continue;

		var replaceableNode = document.createElement('span');
		replaceableNode.className = detectedNumberClassName;
		var matches = node.data.match(telRegex);

		// iterate through pattern match(es)
		for (var j = 0; j < matches.length; j++) {
			var matchGroups = telRegex.exec(matches[j]);
			var otherNodeParts = node.data.split(matches[j]);

			for (var k = 0; k < otherNodeParts.length; k++) {
				replaceableNode.appendChild(document.createTextNode(otherNodeParts[k]));
				if (k % 2 == 0) {
					var formattedPhoneText = matchGroups[0];
					var whatsappLink = createWhatsAppAPILink(settings, matchGroups);

					var link = document.createElement('a');
					var linkTitle = getMessage('popup_title_link');
					link.className = detectedNumberClassName;
					link.href = whatsappLink;
					link.target = '_blank';
					link.appendChild(document.createTextNode(formattedPhoneText));
					link.title = `${linkTitle}: ${formattedPhoneText}`;
					replaceableNode.appendChild(link);
				}
			}
		}

		if (node.parentElement.tagName != 'A')
			node.parentNode.replaceChild(replaceableNode, node);
		else
			node.parentNode.parentNode.replaceChild(replaceableNode, node.parentNode);
	}
}

function walkTheDOM(node, func) {
	func(node);
	node = node.firstChild;
	while (node) {
		var nextNode = node.nextSibling;
		walkTheDOM(node, func);
		node = nextNode;
	}
}
