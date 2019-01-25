# Design Document

This is mainly to explain the various implementation choices and document what I've learnt about security/cryptography while doing this.

## Principles

Trust no one (or as few external parties as possible)
- Assume code coming from sources I don't control can be maliciously modified
- No external packages - works fine as static files
- Currently only assumes your browser and browser related code (e.g. browser extensions that can read and/or modify the page) are trustworthy

## Using passphrase based encryption

Easier for people to type into another device.

## AES-GCM

At this point, I just chose a random well-used symmetric encryption standard.

Note that using randomly generated IVs for encryption does not work well with Counter Based modes of AES (of which GCM is one), due to the possibility of having duplicate (key, IV) pairs revealing patterns in the data. See section below on salts and IVs as well as [this image](https://twitter.com/angealbertini/status/425561082841690112/photo/1).

## Using PBKDF2 to derive the key from passphrase

No good reason, will look into bcrypt and other alternatives soon.

https://security.stackexchange.com/questions/133239/what-is-the-specific-reason-to-prefer-bcrypt-or-pbkdf2-over-sha256-crypt-in-pass

## Using salts/IVs of length x

For PBKDF2 using a 256 bit salt, see:
* https://stackoverflow.com/questions/17218089/salt-and-hash-using-pbkdf2
* https://crackstation.net/hashing-security.htm (short salt section)
* https://tools.ietf.org/html/rfc8018#section-4

General guidelines:
* Longer salts lower the probability of key collisions
* Longer salts also prevent attackers from building a lookup table for all the salt possibilities
* PBKDF2's RFC recommends at least 64 bits
* A good rule of thumb is to use a salt that is the same size as the output of the hash function

[For AES-GCM using a 96 bit IV](https://crypto.stackexchange.com/questions/41601/aes-gcm-recommended-iv-size-why-12-bytes/41610)

## Sending salts/IVs in plaintext

Salts are meant to prevent attacks using pre-computed hashes (rainbow tables). This means that if an attacker knows the salt, they can perform a brute force attack but the attack will be slowed down significantly.

If the passphrase is simple and/or easy to guess (e.g. p4ssw0rd123), the brute force attack may still be completed quickly.

## Salt for key generation VS IV for encryption

See: https://security.stackexchange.com/a/48018

> They serve the same purpose, but are technically used in different operations. Salt is used when hashing, IV when encrypting. In both cases, the purpose is to prevent the same input from always resulting in the same output by adding a random input.

See: https://stackoverflow.com/questions/36760973/why-is-random-iv-fine-for-aes-cbc-but-not-for-aes-gcm

> GCM is a variation on Counter Mode (CTR). As you say, with any variant of Counter Mode, it is essential that the Nonce is not repeated with the same key. 

For randomly generated 96 bit IVs, a duplicate IV has a 50% probability of occuring after 2^(n/2)=2^48 nonces.

If we use different random values as the salt for key generation and IV for encryption, the probability of having duplicate (IV, key) pairs is further reduced (TODO: by how much?).