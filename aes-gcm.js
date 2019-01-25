// This is largely inspired by:
// https://github.com/mdn/dom-examples/blob/60b72ef406808b463593d4ac4e92d3465a5ad9e5/web-crypto/encrypt-decrypt/aes-cbc.js

(() => {

  // Taken from:
  // https://gist.github.com/gala132/2bbd7907cc36b8a9779e922570d1ab85
  /**
   * Given a passphrase, this generates a crypto key
   * using `PBKDF2` with SHA256 and 1000 iterations.
   * If no salt is given, a new one is generated.
   * The return value is an array of `[key, salt]`.
   * @param {String} passphrase 
   * @param {UInt8Array} salt [salt=random bytes]
   * @returns {Promise<[CryptoKey,UInt8Array]>} 
   */
  function deriveKey(passphrase, salt) {
    salt = salt || window.crypto.getRandomValues(new Uint8Array(32));

    return window.crypto.subtle
      .importKey("raw", passphrase, "PBKDF2", false, ["deriveKey"])
      .then(key =>
        crypto.subtle.deriveKey(
          { name: "PBKDF2", salt, iterations: 10000, hash: "SHA-256" },
          key,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"],
        ),
      )
      .then(key => [key, salt]);
  }

  /*
  Fetch the contents of the "message" textbox, and encode it
  in a form we can use for the encrypt operation.
  */
  function getTextEncoding(selector) {
    const messageBox = document.querySelector(selector);
    let message = messageBox.value;
    let enc = new TextEncoder();
    return enc.encode(message);
  }

  /*
  Get the encoded message, encrypt it and display a representation
  of the ciphertext in the "Ciphertext" element.
  */
  async function encryptMessage(passphrase) {
    let encoded = getTextEncoding("#aes-gcm-message");
    // The iv must never be reused with a given key.
    const ivMsg = window.crypto.getRandomValues(new Uint8Array(12));
    const ivMsgValue = document.querySelector(".aes-gcm .ivMsg-value");
    ivMsgValue.textContent = `${ivMsg}`;

    const [key, ivKey] = await deriveKey(passphrase);
    const ivKeyValue = document.querySelector(".aes-gcm .ivKey-value");
    ivKeyValue.textContent = `${ivKey}`;

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: ivMsg
      },
      key,
      encoded
    );

    const ciphertextValue = document.querySelector(".aes-gcm .ciphertext-value");
    ciphertextValue.textContent = `${new Uint8Array(ciphertext)}`;
  }

  /*
  Takes key, ciphertext, key IV and message IV as inputs and decrypts the ciphertext.
  Write the decrypted message into the "Decrypted" box.
  */
  async function decryptMessage(passphrase, ciphertext, ivKey, ivMsg) {
    const [key, _] = await deriveKey(passphrase, ivKey);
    let decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivMsg
      },
      key,
      ciphertext
    );

    let dec = new TextDecoder();
    const decryptedValue = document.querySelector(".aes-gcm .decrypted-value");
    decryptedValue.textContent = dec.decode(decrypted);
  }


  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  ///// Register event listeners to the encode and decode buttons
  /////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////
  const encryptButton = document.querySelector(".aes-gcm .encrypt-button");
  encryptButton.addEventListener("click", () => {
    const passphrase = getTextEncoding("#aes-gcm-passphrase");
    encryptMessage(passphrase);
  });

  const decryptButton = document.querySelector(".aes-gcm .decrypt-button");
  decryptButton.addEventListener("click", () => {

    const decMessageBox = document.querySelector("#aes-gcm-dec-message");
    const message = decMessageBox.value;

    const passphrase = getTextEncoding("#aes-gcm-dec-pass");

    const ivMsgBox = document.querySelector("#aes-gcm-dec-ivMsg");
    const ivMsgValue = ivMsgBox.value;

    const ivKeyBox = document.querySelector("#aes-gcm-dec-ivKey");
    const ivKeyValue = ivKeyBox.value;

    // THIS IS A BAD HACK
    const ciphertext = Uint8Array.from(message.split(','));
    const ivMsg = Uint8Array.from(ivMsgValue.split(','));
    const ivKey = Uint8Array.from(ivKeyValue.split(','));
    decryptMessage(passphrase, ciphertext, ivKey, ivMsg);
  });

})();