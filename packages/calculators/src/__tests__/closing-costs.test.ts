import { calculateClosingCosts } from '../calculations/closing-costs'
import {
  LEGAL_FEES,
  TITLE_INSURANCE,
  HOME_INSPECTION,
  APPRAISAL_FEE,
} from '../constants/defaults'

describe('Closing Costs calculations', () => {
  it('should calculate all closing cost components', () => {
    const result = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(result.landTransferTax).toBeDefined()
    expect(result.legalFees).toBe(LEGAL_FEES)
    expect(result.titleInsurance).toBe(TITLE_INSURANCE)
    expect(result.homeInspection).toBe(HOME_INSPECTION)
    expect(result.appraisal).toBe(APPRAISAL_FEE)
    expect(result.totalClosingCosts).toBeGreaterThan(0)
    expect(result.cashNeeded).toBe(result.totalClosingCosts + 100000)
  })

  it('should include CMHC PST in closing costs when required', () => {
    const withCMHC = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 50000, // 10% down - CMHC required
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    const withoutCMHC = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000, // 20% down - no CMHC
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(withCMHC.cmhc.isRequired).toBe(true)
    expect(withCMHC.cmhc.pstOnPremium).toBeGreaterThan(0)
    expect(withoutCMHC.cmhc.isRequired).toBe(false)
    expect(withoutCMHC.cmhc.pstOnPremium).toBe(0)
  })

  it('should apply first-time buyer LTT rebates', () => {
    const firstTimeBuyer = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: true,
      isTorontoProperty: false,
    })

    const notFirstTimeBuyer = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(firstTimeBuyer.landTransferTax.netLTT).toBeLessThan(
      notFirstTimeBuyer.landTransferTax.netLTT
    )
  })

  it('should include Toronto LTT when applicable', () => {
    const toronto = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: false,
      isTorontoProperty: true,
    })

    const nonToronto = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(toronto.landTransferTax.torontoLTT).toBeGreaterThan(0)
    expect(nonToronto.landTransferTax.torontoLTT).toBe(0)
    expect(toronto.totalClosingCosts).toBeGreaterThan(nonToronto.totalClosingCosts)
  })

  it('should calculate cash needed correctly', () => {
    const result = calculateClosingCosts({
      homePrice: 600000,
      downPayment: 120000,
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(result.cashNeeded).toBe(result.totalClosingCosts + 120000)
  })

  it('should include all expected components in result', () => {
    const result = calculateClosingCosts({
      homePrice: 500000,
      downPayment: 100000,
      isFirstTimeBuyer: false,
      isTorontoProperty: false,
    })

    expect(result).toHaveProperty('landTransferTax')
    expect(result).toHaveProperty('cmhc')
    expect(result).toHaveProperty('legalFees')
    expect(result).toHaveProperty('titleInsurance')
    expect(result).toHaveProperty('homeInspection')
    expect(result).toHaveProperty('appraisal')
    expect(result).toHaveProperty('adjustments')
    expect(result).toHaveProperty('totalClosingCosts')
    expect(result).toHaveProperty('cashNeeded')
  })
})
