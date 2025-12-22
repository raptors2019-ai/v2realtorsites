export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Canadian phone number validation (10 or 11 digits)
  const phoneRegex = /^[+]?1?[-.\s]?[(]?\d{3}[)]?[-.\s]?\d{3}[-.\s]?\d{4}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string): boolean {
  // Canadian postal code validation
  const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return postalRegex.test(postalCode)
}
