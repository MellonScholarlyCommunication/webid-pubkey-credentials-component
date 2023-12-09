const crypto = require("crypto");
const fs = require("fs");

const outdir = process.argv[2];

if (!outdir) {
    console.error("usage: bin/generate_keys.js outdir");
    process.exit(1);
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    // The standard secure default length for RSA keys is 2048 bits
    modulusLength: 2048
});

const pubKey = publicKey.export({type: 'spki', format: 'pem'}).toString()
const privKey = privateKey.export({type: 'pkcs8', format: 'pem'}).toString()

console.log(`${outdir}/rsa_pub.pem`);
fs.writeFileSync(`${outdir}/rsa_pub.pem`,pubKey,{ encoding: 'utf8' });

console.log(`${outdir}/rsa_priv.pem`);
fs.writeFileSync(`${outdir}/rsa_priv.pem`,privKey,{ encoding: 'utf8' });