const fs = require('fs');
const crypto = require('crypto');

if (process.argv.length < 6) {
    console.error('usage: bin/headers.js key webid method url [file]');
    process.exit(1);
}

const key = process.argv[2];
const webid = process.argv[3];
const method = process.argv[4];
const url = process.argv[5];
const path = process.argv[6];

if (method === 'GET' || method === 'HEAD' || method === 'DELETE') {
    do_get(key,webid,method,url);
}
else {
    do_post(key,webid,method,url,path);
}

async function do_get(keyPath,webid,method,url,filePath) {
    const key    = fs.readFileSync(keyPath, { encoding: 'utf8'} );

    const urlObj = new URL(url);
    const host   = urlObj.host;
    const path   = urlObj.pathname;

    const date   = new Date().toUTCString();

    const sigTest =
    "(request-target): " + method + " " + path + "\n" +
    "host: " + host + "\n" +
    "date: " + date + "\n";

    const signature = await crypto.sign('SHA256', Buffer.from(sigTest), key);
    const signature_b64 = signature.toString('base64url');

    const headers =
        `-H 'Host: ${host}' ` + 
        `-H 'Date: ${date}' ` + 
        `-H 'Signature: webId="${webid}",headers="(request-target) host date",signature="${signature_b64}"'`;

    console.log(headers);
}

async function do_post(keyPath,webid,method,url,filePath) {
    const key    = fs.readFileSync(keyPath, { encoding: 'utf8'} );

    const urlObj = new URL(url);
    const host   = urlObj.host;
    const path   = urlObj.pathname;

    const date   = new Date().toUTCString();
    const filedata = fs.readFileSync(filePath, { encoding: 'utf8' });

    const shasum = crypto.createHash("SHA256"); 
    shasum.update(filedata,'utf8');
    const digest = `sha256=` + shasum.digest('base64');

    const sigTest =
    "(request-target): " + method + " " + path + "\n" +
    "host: " + host + "\n" +
    "date: " + date + "\n" + 
    "digest: " + digest + "\n";

    const signature = await crypto.sign('SHA256', Buffer.from(sigTest), key);
    const signature_b64 = signature.toString('base64url');

    const headers =
        `-H 'Host: ${host}' ` + 
        `-H 'Date: ${date}' ` + 
        `-H 'Digest: ${digest}' ` +
        `-H 'Signature: webId="${webid}",headers="(request-target) host date digest",signature="${signature_b64}"'`;

    console.log(headers);
}

