
/**
 * Returns the Jenkins's one-at-a-time hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/Jenkins_hash_function#one_at_a_time
 * 
 * @param str - The input string
 * @returns The Jenkins's one-at-a-time hash of `str`
 */
export function joaat(str: string): number {

    let hash: number = 0;
    for (let index = 0; index < str.length; index++) {
        hash += str.charCodeAt(index);
        hash += hash << 10;
        hash ^= hash >>> 6;
    }
    hash += hash << 3;
    hash ^= hash >>> 11;
    hash += hash << 15;
    return (hash >>> 0); // convert to unsigned
}

/**
 * Returns the ELF hash of a string.
 * 
 * @remarks https://en.wikipedia.org/wiki/PJW_hash_function
 * 
 * @param str - The input string
 * @returns The ELF hash of `str`
 */
export function elf(str: string): number {
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
    return (hash >>> 0); // convert to unsigned
}