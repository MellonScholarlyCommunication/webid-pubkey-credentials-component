import type { Quad } from 'n3';
import { DataFactory } from 'n3';
import { verify } from 'node:crypto';
import { 
    type Credentials, 
    CredentialsExtractor,
    HttpRequest,
    fetchDataset,
    NotImplementedHttpError,
    BadRequestHttpError,
    getLoggerFor 
} from '@solid/community-server';

const SEC_PUBKEY = 'https://w3id.org/security#publicKey';
const SEC_PUBKEY_PEM = 'https://w3id.org/security#publicKeyPem';

const { namedNode } = DataFactory;

/**
 * Extracts the "public credentials", to be used for data everyone has access to.
 * This class mainly exists so a {@link Credentials} is still generated in case the token parsing fails.
 */
export class WebidPubkeyCredentialsExtractor extends CredentialsExtractor {
  private readonly urlMatch : string[] = [ '.*' ];
  protected readonly logger = getLoggerFor(this);

  public constructor(urlMatch: string[]) {
    super();
    this.urlMatch = urlMatch;
  }

  public async canHandle({ url }: HttpRequest): Promise<void> {
    let found = false;

    /**
     * Only allow this CredentialsExtractor for urls that match urlMatch
     */
    for (let i = 0 ; i < this.urlMatch.length ; i++) {
        const match = this.urlMatch[i];
        if (url?.match(new RegExp(match))) {
            found = true;
            break;
        }  
    }

    if (found) {
        this.logger.debug(`${url} matched`);
    }
    else {
        this.logger.debug(`${url} not matched`);
        throw new NotImplementedHttpError(`No matching implementation for ${url}`);
    }
  }

  public async handle(request: HttpRequest): Promise<Credentials> {
    const { headers: { signature, host, date, digest }, method , url } = request;

    this.logger.debug('***WebidPubkeyCredentialsExtractor***');

    if (!signature) {
        this.logger.debug('No signature header');
        return {};
    }

    if (!date) {
        this.logger.debug('No date header');
        return {};
    }

    const delta = Date.now() - Date.parse(date);

    if (delta >= 24 * 3600 * 1000) {
        this.logger.info(`Request date too far in the past ${date} (${delta})`);
        return {};
    }

    if ( method?.match(/^(POST|PUT|PATCH)$/) && !digest) {
        this.logger.debug('No digest header');
        return {};
    }

    const sig                    = this.parseSignature(signature);
    const webId  : string        = sig['webId'];
    const signature_str : string = sig['signature'];

    if (!webId || ! signature_str) {
        this.logger.debug('No keyId or signature in signature header');
        return {};
    }

    this.logger.info(`Parsed: webId: ${webId} ; signature: ${signature_str}`);

    let sigTest;

    if (method?.match(/^(POST|PUT|PATCH)$/)) {
        sigTest = 
            "(request-target): " + method.toLowerCase() + " " + url + "\n" +
            "host: " + host + "\n" +
            "date: " + date + "\n" +
            "digest: " + digest + "\n";
    }
    else {
        sigTest = 
            "(request-target): " + method?.toLowerCase() + " " + url + "\n" +
            "host: " + host + "\n" +
            "date: " + date + "\n";
    }

    this.logger.debug(`sigTest: ${sigTest}`);

    const publicKey = await this.getPublicKeyPem(webId);

    if (!publicKey) {
        this.logger.info(`No public key for ${webId}`);
        return {}
    }

    this.logger.debug(`PublicKey (remote): ${publicKey}`);

    const res = verify(
        'SHA256',
        Buffer.from(sigTest),
        publicKey,
        Buffer.from(signature_str, 'base64')
    );

    if (res) {
        this.logger.info(`Verify: success`);
        const credentials: Credentials = { agent: { webId: webId } };
        return credentials;
    }
    else {
        this.logger.info(`Verify: failed`);
        return {};
    }
  }

  private parseSignature(signature: string | string[]) : any {
    const sig_str = Array.isArray(signature) ? signature[0] : signature;

    if (! sig_str) {
        throw new BadRequestHttpError('Invalid Signature header.');
    }

    const signature_parsed : any = sig_str.split(",").map( (pair) => {
        const parts = pair.split("=").map( (value) => {
            return value.replace(/^"/,'').replace(/"$/,'')
        });
        return parts;
    });

    const sig = Object.fromEntries(signature_parsed);

    return sig;
  }

  private async getPublicKeyPem(webId: string) : Promise<string | undefined> {
    this.logger.info(`fetching: ${webId}`);

    try {
        const representation = await fetchDataset(webId);

        const triples : Quad[] = [];
        
        for await (const data of representation.data) {
            const triple = data as Quad;
            triples.push(triple);
        }

        const pubKeyTriple = triples.find( (triple) => {
            if (triple.subject.equals(namedNode(webId)) &&
                triple.predicate.equals(namedNode(SEC_PUBKEY))) {
                return true;
            }
            else {
                return false;
            }
        });

        if (! pubKeyTriple) {
            this.logger.info(`No ${SEC_PUBKEY} in ${webId}`);
            return undefined;
        }

        const pubKeyPemTriple = triples.find( (triple) => {
            if (triple.subject.equals(pubKeyTriple.object) &&
                triple.predicate.equals(namedNode(SEC_PUBKEY_PEM))) {
                return true;
            }
            else {
                return false;
            }
        });

        if (! pubKeyPemTriple) {
            this.logger.info(`No ${SEC_PUBKEY_PEM} for ${pubKeyTriple.object.value}`);
            return undefined;
        }

        return pubKeyPemTriple.object.value;
    }
    catch (e) {
        this.logger.info(`Failed : ${e}`);
        return undefined;
    }
  }
}