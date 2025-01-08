/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));