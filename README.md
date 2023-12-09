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
for which this module is applicable. In the example, the  `/inbox/` resources uses the
webid-pubkey-credentials method.

## Example

### Create a private/public key pair

```
# .test is an output directory
node bin/generate_keys.js .test
```

### Write the public key in your webid profile

```
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix solid: <http://www.w3.org/ns/solid/terms#>.

<>
    a foaf:PersonalProfileDocument;
    foaf:maker <http://localhost:3000/test/profile/card#me>;
    foaf:primaryTopic <http://localhost:3000/test/profile/card#me>.

<http://localhost:3000/test/profile/card#me>
    a foaf:Person;
    solid:oidcIssuer <http://localhost:3000/>;
    <https://w3id.org/security#publicKey> <http://localhost:3000/test/profile/card#main-key> .

<http://localhost:3000/test/profile/card#main-key> <https://w3id.org/security#publicKeyPem> '''-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp6y7IELZ63Up0bb+mxby
1wILqb5QtuUvALUQxk41dEJloj6Krrvf7s+77B0shNKplnwlvNXCnTexdLBjbs3f
7GELp7h4Dp46bIutUPfBizf71VyqO8eFX94Hur3uaPSr2uLpu1IKXpX/SIwXjcqg
7s+1b2LrOLla344TcnHokoDN3mhUznif0GOcQxksU1UKcDKF3aM2ug6h8xSLh1pv
wFCiZyXi7HHMxaJD1b5CC7a8+kMWDsNDjDYMKNl4jk9HTNrcvzgUDHbNzi9NdUis
7qdZFBsjs0LwWv+J6Kh4/p6YpDndefQupNsI7ziZR6r+fpHPJwhc6wpjFLetvbOh
4wIDAQAB
-----END PUBLIC KEY-----
''' .
```

### Provide access the the webid

Provide in the ACL/ACP configuration of the Pod access for the webid containing
the public keys.

### Execute a request against the /inbox/

```
./demo.sh
```

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