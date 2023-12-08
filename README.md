# Webid-Pubkey-Credentials component

This repository contains an external component that can be injected into the 
[Community Solid Server](https://github.com/CommunitySolidServer/CommunitySolidServer) (CSS).
The component allows extraction of credentials based on [Mastodon](https://docs.joinmastodon.org/spec/security/#ld) style HTTP Signatures.

HTTP GET requests should contain the following headers:

- `host` : the hostname (+ optional port) of the Pod
- `date` : a UTC date string
- `signature` : a comma delimited pair of name/value pairs:
    - `keyId` : a WebID
    - `signature` : a base64 encoded signature value (see below)

HTTP POST/PUT/PATCH requests should also contain the followig headers:

- `digest` : a base64 encoded RSA-SHA256 hash of the request body

The signature string is constructed using the values of the HTTP headers defined in headers, joined by newlines. See https://docs.joinmastodon.org/spec/security/#ld and https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/ for a procedure.

## Configuration

See: `credentials.json` for an example configuration file. The `urlMatch` limits resources
for which this module is applicable.

## Running the server

Clone this repository, the install the packages

```
npm i
```

To run the server with use :

```
npm run start
```

## Feedback and questions

Ask [Patrick Hochstenbach](mailto:Patrick.Hochstenbach@UGent.be).