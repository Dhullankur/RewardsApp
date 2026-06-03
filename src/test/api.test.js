import { describe, expect, it } from 'vitest'
import { centsToDollars } from '../api'

describe('centsToDollars', () => {
  it('converts integer cents to dollars', () => {
    expect(centsToDollars(8000)).toBe(80)
    expect(centsToDollars(4599)).toBe(45.99)
    expect(centsToDollars(10020)).toBe(100.2)
  })

  it('returns 0 for invalid values', () => {
    expect(centsToDollars(undefined)).toBe(0)
    expect(centsToDollars('abc')).toBe(0)
  })
})
