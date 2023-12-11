import {
    getLoggerFor,
    type HttpRequest,
    type RepresentationMetadata,
    MetadataParser,
    BadRequestHttpError,
    SOLID_META
} from '@solid/community-server';
import { HH } from './Vocabularies';

/**
 * Converts the contents of the digest header to metadata.
 */
export class DigestParser extends MetadataParser {
  protected readonly logger = getLoggerFor(this);

  public async handle(input: { request: HttpRequest; metadata: RepresentationMetadata }): Promise<void> {
    const { digest } = input.request.headers;
    if (digest) {
      if (Array.isArray(digest)) {
        this.logger.warn(`Expected 0 or 1 Digest headers but received ${digest.length}`);
        throw new BadRequestHttpError('Request has multiple Digest headers');
      }
      this.logger.debug(`Request Digest is '${digest}'.`);
      // Put the data in the SOLID_META.terms.ResponseMetadata so that it
      // will be cleaned automatically after use...
      input.metadata.set(HH.terms.digest,digest,SOLID_META.terms.ResponseMetadata);
    }
  }
}