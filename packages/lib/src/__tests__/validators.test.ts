import { isValidEmail, isValidPhone, isValidPostalCode } from '../validators'

describe('validators', () => {
  describe('isValidEmail', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'first.last@subdomain.example.com',
      'email123@test.io',
    ]

    const invalidEmails = [
      '',
      'invalid',
      'no@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'missing@.com',
      'double@@at.com',
    ]

    it.each(validEmails)('should return true for valid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(true)
    })

    it.each(invalidEmails)('should return false for invalid email: %s', (email) => {
      expect(isValidEmail(email)).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    const validPhones = [
      '4165551234',
      '416-555-1234',
      '(416) 555-1234',
      '416.555.1234',
      '1-416-555-1234',
      '+1-416-555-1234',
      '14165551234',
    ]

    const invalidPhones = [
      '',
      '123',
      '12345',
      '123456789', // 9 digits
      '12345678901234', // Too many digits
      'abc-def-ghij',
      '416-555-123', // 9 digits
    ]

    it.each(validPhones)('should return true for valid phone: %s', (phone) => {
      expect(isValidPhone(phone)).toBe(true)
    })

    it.each(invalidPhones)('should return false for invalid phone: %s', (phone) => {
      expect(isValidPhone(phone)).toBe(false)
    })
  })

  describe('isValidPostalCode', () => {
    const validPostalCodes = [
      'M5V 3A8',
      'M5V3A8',
      'm5v 3a8',
      'M5V-3A8',
      'L4C 9T2',
      'K1A 0B1',
    ]

    const invalidPostalCodes = [
      '',
      '12345',
      'ABCDEF',
      'M5V 38', // Missing letter
      '5M5V 3A8', // Starts with number
      'M5V 3A88', // Extra digit
    ]

    it.each(validPostalCodes)('should return true for valid postal code: %s', (code) => {
      expect(isValidPostalCode(code)).toBe(true)
    })

    it.each(invalidPostalCodes)('should return false for invalid postal code: %s', (code) => {
      expect(isValidPostalCode(code)).toBe(false)
    })
  })
})
