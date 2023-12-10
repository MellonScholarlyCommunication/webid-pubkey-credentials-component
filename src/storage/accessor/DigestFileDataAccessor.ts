import {
    getLoggerFor,
    type DataAccessor,
    FileDataAccessor,
    FileIdentifierMapper,
    ResourceIdentifier,
    RepresentationMetadata,
    createVocabulary,
    UnsupportedMediaTypeHttpError,
    Guarded,
    guardedStreamFrom
} from '@solid/community-server';
import type { Readable } from 'node:stream';
import crypto from 'node:crypto';
import { HH } from '../../http/input/metadata/Vocabularies';

export class DigestFileDataAccessor extends FileDataAccessor implements DataAccessor {
    protected readonly logger = getLoggerFor(this);

    public constructor(resourceMapper: FileIdentifierMapper) {
        super(resourceMapper);
    }

    public async writeDocument(identifier: ResourceIdentifier, data: Guarded<Readable>, metadata: RepresentationMetadata):
    Promise<void> {
        let clone = data;

        const digest = metadata.get(HH.terms.digest);
        if (digest && digest.value.startsWith('sha256=')) {
            const digest_value = digest.value.replace(/^sha256=/,'');
            this.logger.info(`digest (header): ${digest_value}`);

            const buffer = await this.readableToBuffer(data);

            const shasum = crypto.createHash("SHA256"); 
            shasum.update(buffer);
            const digest_calc = shasum.digest('base64url');

            this.logger.info(`digest (data): ${digest_calc}`);

            if (digest_value !== digest_calc) {
                throw new UnsupportedMediaTypeHttpError('Digest doesn\'t match stored content.');
            }

            clone = guardedStreamFrom(buffer);
        }
        return super.writeDocument(identifier,clone,metadata);
    }

    private async readableToBuffer(data: Guarded<Readable>) : Promise<Buffer> {
        return new Promise( (resolve) => {
            let bufs : any = [];
            data.on('data', (d) => { bufs.push(d); });
            data.on('end', () => { resolve(Buffer.concat(bufs)); }); 
        });
    }
}