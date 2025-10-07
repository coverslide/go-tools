import { v1, v3, v4, v5, v7, validate, version } from 'uuid';

export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v7';

export interface UuidOptions {
    version: UuidVersion;
    namespace?: string;
    name?: string;
}

export function generateUuid(options: UuidOptions): string {
    switch (options.version) {
        case 'v1':
            return v1();
        case 'v3':
            if (!options.namespace || !validate(options.namespace)) {
                throw new Error('A valid namespace UUID is required for v3');
            }
            if (!options.name) {
                throw new Error('A name is required for v3');
            }
            return v3(options.name, options.namespace);
        case 'v5':
            if (!options.namespace || !validate(options.namespace)) {
                throw new Error('A valid namespace UUID is required for v5');
            }
            if (!options.name) {
                throw new Error('A name is required for v5');
            }
            return v5(options.name, options.namespace);
        case 'v7':
            return v7();
        case 'v4':
        default:
            return v4();
    }
}

const UUID_V1_EPOCH_OFFSET = 12219292800000; // Offset between UUID epoch (Oct 15, 1582) and Unix epoch (Jan 1, 1970) in milliseconds

export function extractTimestamp(uuid: string): number | null {
    if (!validate(uuid)) {
        throw new Error("Invalid UUID format");
    }

    const uuidVersion = version(uuid);

    if (uuidVersion === 1) {
        // Extract time_low, time_mid, time_hi_and_version
        const hex = uuid.replace(/-/g, '');
        const timeLow = BigInt(parseInt(hex.substring(0, 8), 16));
        const timeMid = BigInt(parseInt(hex.substring(8, 12), 16));
        const timeHiAndVersion = BigInt(parseInt(hex.substring(12, 16), 16));

        // Reconstruct 60-bit timestamp using BigInt
        const timestamp100ns = (timeHiAndVersion & 0x0FFFn) * (2n ** 48n) + timeMid * (2n ** 32n) + timeLow;
        const unixTimestampMs = Number(timestamp100ns / 10000n) - UUID_V1_EPOCH_OFFSET;
        return unixTimestampMs;
    } else if (uuidVersion === 7) {
        // v7 UUIDs embed a Unix timestamp in the first 48 bits
        const hex = uuid.replace(/-/g, '');
        const timestampHex = hex.substring(0, 12); // First 12 hex chars = 48 bits
        return parseInt(timestampHex, 16);
    }

    return null; // No timestamp in other UUID versions
}
