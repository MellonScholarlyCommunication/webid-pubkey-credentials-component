#!/bin/bash

KEY=".test/rsa_priv.pem"
URL="http://localhost:3000/test/inbox/"
WEBID="http://localhost:3000/test/profile/card#me"
FILE="announce.jsonld"
CONTENT_TYPE="application/ld+json"

HEADERS=$(node bin/headers.js ${KEY} ${WEBID} POST ${URL} ${FILE})

LENGTH=$(wc -c < ${FILE})

CMD="curl -s ${HEADERS} -H 'Content-Length: ${LENGTH}' -H 'Content-Type: ${CONTENT_TYPE}' --data-binary '@${FILE}' ${URL}"

eval $CMD