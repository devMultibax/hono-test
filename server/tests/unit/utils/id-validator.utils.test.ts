import { describe, it, expect } from 'vitest'
import { parseRouteId, requireRouteId } from '../../../src/utils/id-validator.utils'
import { ValidationError } from '../../../src/lib/errors'
import { CODES } from '../../../src/constants/error-codes'

describe('id-validator.utils', () => {
  describe('parseRouteId', () => {
    it('returns a parsed integer for a valid numeric string', () => {
      expect(parseRouteId('42')).toEqual({ id: 42 })
    })

    it('returns an error for a non-numeric string', () => {
      expect(parseRouteId('abc')).toMatchObject({ error: expect.any(String) })
    })

    it('returns an error for an empty string', () => {
      expect(parseRouteId('')).toMatchObject({ error: expect.any(String) })
    })

    it('returns an error for a floating-point string', () => {
      expect(parseRouteId('1.5')).toMatchObject({ error: expect.any(String) })
    })

    it('returns an error for zero', () => {
      expect(parseRouteId('0')).toMatchObject({ error: expect.any(String) })
    })

    it('returns an error for a negative number', () => {
      expect(parseRouteId('-1')).toMatchObject({ error: expect.any(String) })
    })
  })

  describe('requireRouteId', () => {
    it('returns a valid parsed integer', () => {
      expect(requireRouteId('10', 'TEST_INVALID_ID')).toBe(10)
    })

    it('throws ValidationError with the provided error code for a non-numeric string', () => {
      expect(() => requireRouteId('xyz', CODES.USER_INVALID_ID)).toThrow(ValidationError)
      expect(() => requireRouteId('xyz', CODES.USER_INVALID_ID)).toThrow(CODES.USER_INVALID_ID)
    })

    it('throws ValidationError for zero', () => {
      expect(() => requireRouteId('0', CODES.DEPARTMENT_INVALID_ID)).toThrow(ValidationError)
    })

    it('throws ValidationError for a negative number', () => {
      expect(() => requireRouteId('-5', CODES.SECTION_INVALID_ID)).toThrow(ValidationError)
    })
  })
})
