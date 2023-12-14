const fs = require("fs");

if (process.argv.length != 4) {
    console.error('usage: make_webid.js webid pubkey');
    process.exit(1);
}

const webid = process.argv[2];
const pubkey = process.argv[3];

const data = fs.readFileSync(pubkey, { encoding: 'utf8'} );

const mainKey = webid.replace(/#.*/g,'') + '#main-key';

console.log(
    JSON.stringify({
        "@context" : [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1"
        ],
        "id": webid,
        "type": "Person",
        "publicKey": {
            "id": mainKey,
            "publicKeyPem": data
        }
    }, null,4));

