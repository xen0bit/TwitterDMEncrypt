async function encrypt(pt) {
	const keyPair = await crypto.subtle.generateKey(
		{
			name: "RSA-OAEP",
			modulusLength: 4096,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256"
		},
		true,
		["encrypt", "decrypt"]
	);
	const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
	const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

	var toUint8 = new TextEncoder();
	var ptBuffer = toUint8.encode(pt).buffer;

	window.crypto.subtle.encrypt(
		{
			name: "RSA-OAEP",
		},
		keyPair.publicKey, //from generateKey or importKey above
		ptBuffer //ArrayBuffer of data you want to encrypt
	)
		.then(function (encrypted) {
			//returns an ArrayBuffer containing the encrypted data
			var encryptedUint8 = new Uint8Array(encrypted)
			//console.log(encryptedUint8);
			var fromUint8 = new TextDecoder('utf-8');
			var base64Encrypted = btoa(unescape(encodeURIComponent(fromUint8.decode(encryptedUint8))));
			var sendButton = document.querySelector('[aria-label="Send"]');
			var textBox = document.querySelector('.DraftEditor-root');
			//Select the text box under it
			var textBox = textBox.querySelector('span[data-text="true"]');
			var encyrptedMessage = "-----BEGIN RSA-OAEP ENCRYPTED MESSAGE-----\n"
			encyrptedMessage+=base64Encrypted;
			encyrptedMessage+="\n-----BEGIN RSA-OAEP ENCRYPTED MESSAGE-----"
			textBox.textContent = encyrptedMessage;
			
		})
		.catch(function (err) {
			console.error(err);
		});
}

chrome.extension.sendMessage({}, function (response) {
	var readyStateCheckInterval = setInterval(function () {
		if (document.readyState === "complete" && document.querySelector('[aria-label="Send"]') && document.querySelector('.DraftEditor-root')) {
			clearInterval(readyStateCheckInterval);

			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log("Hello. This message was sent from scripts/inject.js");
			// ----------------------------------------------------------
			var sendButton = document.querySelector('[aria-label="Send"]');
			sendButton.onclick = function (e) {
				//Fucking one of these has to work so I stop spamming you with messages
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				//Grab the root of the draft editor
				var textBox = document.querySelector('.DraftEditor-root');
				//Select the text box under it
				var textBox = textBox.querySelector('span[data-text="true"]');
				encrypt(textBox.textContent);
			}

		}
	}, 10);
});