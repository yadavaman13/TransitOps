/**
 * Generates a random 8-character password containing:
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 * - At least one special character (!@#$%^&*()_+~|}{[]:;?><,./-=)
 * @returns {string} The generated password
 */
export function generatePassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+~|}{[]:;?><,./-=';

    // Pick one character from each mandatory set
    const u = uppercase[Math.floor(Math.random() * uppercase.length)];
    const l = lowercase[Math.floor(Math.random() * lowercase.length)];
    const n = numbers[Math.floor(Math.random() * numbers.length)];
    const s = specialChars[Math.floor(Math.random() * specialChars.length)];

    // Combine all sets to draw the remaining characters
    const all = uppercase + lowercase + numbers + specialChars;
    let rest = '';
    for (let i = 0; i < 4; i++) {
        rest += all[Math.floor(Math.random() * all.length)];
    }

    // Combine and shuffle the characters to ensure randomness
    const passwordArray = [u, l, n, s, ...rest.split('')];
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = passwordArray[i];
        passwordArray[i] = passwordArray[j];
        passwordArray[j] = temp;
    }

    return passwordArray.join('');
}
