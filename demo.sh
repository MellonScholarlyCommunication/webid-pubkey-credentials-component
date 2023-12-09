#!/bin/bash

KEY=".test/rsa_priv.pem"
URL="http://localhost:3000/test/inbox/"
WEBID="http://localhost:3000/test/profile/card#me"

HEADERS=$(node bin/headers.js ${KEY} ${WEBID} GET ${URL})

CMD="curl -s ${HEADERS} ${URL}"

eval $CMD