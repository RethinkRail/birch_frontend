/**
 * This method will clip floating point 2 digit
 * @param value
 * @returns {string}
 */
export function round2Dec(value) {
    return Number(Math.round(value + 'e' + 2) + 'e-' + 2).toFixed(2);
}