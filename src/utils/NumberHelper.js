/**
 * This method will clip floating point 2 digit
 * @param value
 * @returns {string}
 */
export function round3Dec(value) {
    return Number(Math.round(value + 'e' + 3) + 'e-' + 3).toFixed(3);
}

export function round2Dec(value) {
    return Number(Math.round(value + 'e' + 2) + 'e-' + 2).toFixed(2);
}