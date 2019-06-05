
import * as hashjs from 'hash.js';

/**
 * Returns the Jenkins's one-at-a-time hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/Jenkins_hash_function#one_at_a_time
 * 
 * @param str - The input string
 * @returns The Jenkins's one-at-a-time hash of `str`
 */
export function joaat(str: string): string {

    let hash: number = 0;
    for (let index = 0; index < str.length; index++) {
        hash += str.charCodeAt(index);
        hash += hash << 10;
        hash ^= hash >>> 6;
    }
    hash += hash << 3;
    hash ^= hash >>> 11;
    hash += hash << 15;
    return "0x" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Returns the ELF hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/PJW_hash_function
 * 
 * @param str - The input string
 * @returns The ELF hash of `str`
 */
export function elf(str: string): string {
    let hash: number = 0;
    let high: number = 0;
    for (let index = 0; index < str.length; index++) {
        hash = (hash << 4) + str.charCodeAt(index);
        high = hash & 0xF0000000;
        if (high !== 0) {
            hash ^= high >>> 24;
        }
        hash &= ~high;
    }
    return "0x" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

const fnv1OffsetBasis: number = 2166136261;
// const fnv1Prime: number = 16777619;

/**
 * Returns the FNV-1 hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function#FNV-1_hash
 * 
 * @param str - The input string
 * @returns The FNV-1 hash of `str`
 */
export function fnv1(str: string): string {
    let hash: number = fnv1OffsetBasis;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        // source: https://github.com/sindresorhus/fnv1a/blob/7a72892dc41050c89e229ef0a07cdb239b095d0b/index.js#L12
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        hash ^= ch;
    }
    return "0x" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Returns the FNV-1a hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function#FNV-1a_hash
 * 
 * @param str - The input string
 * @returns The FNV-1a hash of `str`
 */
export function fnv1a(str: string): string {
    let hash: number = fnv1OffsetBasis;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        hash ^= ch;
        // source: https://github.com/sindresorhus/fnv1a/blob/7a72892dc41050c89e229ef0a07cdb239b095d0b/index.js#L12
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return "0x" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

/**
 * Returns the SHA-1 hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/SHA-1
 * 
 * @param str - The input string
 * @returns The SHA-1 hash of `str`
 */
export function sha1(str: string): string {
    return hashjs.sha1().update(str).digest("hex");
}

/**
 * Returns the SHA-256 hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/SHA-2
 * 
 * @param str - The input string
 * @returns The SHA-256 hash of `str`
 */
export function sha256(str: string): string {
    return hashjs.sha256().update(str).digest("hex");
}

/**
 * Returns the SHA-512 hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/SHA-2
 * 
 * @param str - The input string
 * @returns The SHA-512 hash of `str`
 */
export function sha512(str: string): string {
    return hashjs.sha512().update(str).digest("hex");
}