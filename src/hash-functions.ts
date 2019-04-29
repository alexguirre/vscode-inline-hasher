
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
 * Converts a string to lowercase and returns its Jenkins's one-at-a-time hash.
 * 
 * @remarks https://en.wikipedia.org/wiki/Jenkins_hash_function#one_at_a_time
 * 
 * @param str - The input string
 * @returns The Jenkins's one-at-a-time hash of the lowercase version of `str`
 */
export function joaatLowerCase(str: string): number {
    return joaat(str.toLowerCase());
}

/**
 * Converts a string to uppercase and returns its Jenkins's one-at-a-time hash.
 * 
 * @remarks https://en.wikipedia.org/wiki/Jenkins_hash_function#one_at_a_time
 * 
 * @param str - The input string
 * @returns The Jenkins's one-at-a-time hash of the uppercase version of `str`
 */
export function joaatUpperCase(str: string): number {
    return joaat(str.toUpperCase());
}
