/**
 * Generate secure default password in format: xxx@1234
 * - 3 random lowercase letters
 * - @ symbol
 * - 4 random digits
 */
export function generateDefaultPassword(): string {
  const characters = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('')

  const shuffledChars = characters.split('').sort(() => Math.random() - 0.5).join('')
  const numbers = String(Math.floor(1000 + Math.random() * 9000))

  return `${shuffledChars}@${numbers}`
}
