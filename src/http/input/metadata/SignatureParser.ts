import {
    getLoggerFor,
    type HttpRequest,
    type RepresentationMetadata,
    MetadataParser,
    BadRequestHttpError
} from '@solid/community-server';
import { HH } from './Vocabularies';

/**
 * Converts the contents of the signature header to metadata.
 */
export class SignatureParser extends MetadataParser {
  protected readonly logger = getLoggerFor(this);

  public async handle(input: { request: HttpRequest; metadata: RepresentationMetadata }): Promise<void> {
    const { signature } = input.request.headers;
    if (signature) {
      if (Array.isArray(signature)) {
        this.logger.warn(`Expected 0 or 1 Digest headers but received ${signature.length}`);
        throw new BadRequestHttpError('Request has multiple Signature headers');
      }
      this.logger.debug(`Request Signature is '${signature}'.`);
      input.metadata.set(HH.terms.signature,signature);
    }
  }
}