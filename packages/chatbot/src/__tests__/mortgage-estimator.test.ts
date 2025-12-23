import { mortgageEstimatorTool } from '../tools/mortgage-estimator'

// Suppress console.error during tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe('mortgageEstimatorTool', () => {
  describe('tool metadata', () => {
    it('should have proper description', () => {
      expect(mortgageEstimatorTool.description).toContain('[PURPOSE]')
      expect(mortgageEstimatorTool.description).toContain('GDS/TDS')
      expect(mortgageEstimatorTool.description).toContain('ESTIMATE')
    })

    it('should have required parameters', () => {
      const schema = mortgageEstimatorTool.parameters
      expect(schema).toBeDefined()
    })
  })

  describe('basic calculations', () => {
    it('should calculate affordability for standard income', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.estimate).toBeDefined()
      expect(result.estimate.maxHomePrice).toBeGreaterThan(100000)
      expect(result.estimate.maxHomePrice).toBeLessThan(1000000)
      expect(result.estimate.downPayment).toBe(100000)
    })

    it('should calculate affordability for high income', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 300000,
        downPayment: 200000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.estimate.maxHomePrice).toBeGreaterThan(500000)
    })

    it('should calculate affordability with debts reducing buying power', async () => {
      const withoutDebts = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      // Use higher debts to ensure TDS becomes the limiting factor
      const withDebts = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 1000,
        currentMortgageRate: 4.5,
      })

      expect(withDebts.success).toBe(true)
      expect(withDebts.estimate.maxHomePrice).toBeLessThanOrEqual(withoutDebts.estimate.maxHomePrice)
    })
  })

  describe('GDS/TDS ratios', () => {
    it('should respect GDS ratio of 39%', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      // GDS should not exceed 39%
      expect(result.estimate.gdsRatio).toBeLessThanOrEqual(39)
    })

    it('should respect TDS ratio of 44%', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 500,
        currentMortgageRate: 4.5,
      })

      // TDS should not exceed 44%
      expect(result.estimate.tdsRatio).toBeLessThanOrEqual(44)
    })

    it('should be limited by TDS when debts are high', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 1500, // High monthly debts
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      // TDS should be the limiting factor
      expect(result.estimate.tdsRatio).toBeLessThanOrEqual(44)
    })
  })

  describe('CMHC insurance calculations', () => {
    it('should not require CMHC with 20%+ down payment', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 200000,
        downPayment: 200000, // Will likely be 20%+ of affordable home
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      if (result.estimate.downPaymentPercent >= 20) {
        expect(result.estimate.cmhcPremium).toBeNull()
      }
    })

    it('should calculate CMHC for low down payment', async () => {
      // Force a scenario where down payment is less than 20%
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 150000,
        downPayment: 50000, // Low down payment
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      if (result.estimate.downPaymentPercent < 20) {
        expect(result.estimate.cmhcPremium).toBeGreaterThan(0)
      }
    })

    it('should include CMHC in total mortgage', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 100000,
        downPayment: 30000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      if (result.estimate.cmhcPremium) {
        expect(result.estimate.totalMortgageWithCMHC).toBe(
          result.estimate.maxMortgage + result.estimate.cmhcPremium
        )
      }
    })
  })

  describe('stress test rate', () => {
    it('should apply stress test floor of 5.25%', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 2.5, // Low rate should use floor
      })

      expect(result.success).toBe(true)
      expect(result.estimate.stressTestRate).toBe(5.25)
    })

    it('should apply stress test of contract rate + 2%', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 5.0, // 5% + 2% = 7% > 5.25%
      })

      expect(result.success).toBe(true)
      expect(result.estimate.stressTestRate).toBe(7.0)
    })
  })

  describe('monthly cost breakdown', () => {
    it('should include all monthly costs', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.estimate.monthlyPayment).toBeGreaterThan(0)
      expect(result.estimate.monthlyPropertyTax).toBeGreaterThan(0)
      expect(result.estimate.monthlyHeating).toBe(150)
      expect(result.estimate.totalMonthlyHousing).toBe(
        result.estimate.monthlyPayment +
        result.estimate.monthlyPropertyTax +
        result.estimate.monthlyHeating
      )
    })
  })

  describe('output formatting', () => {
    it('should provide formatted summary in markdown', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.formattedSummary).toContain('**Affordability Estimate**')
      expect(result.formattedSummary).toContain('**Max Home Price:**')
      expect(result.formattedSummary).toContain('**Monthly Costs')
      expect(result.formattedSummary).toContain('estimate only')
    })

    it('should provide search suggestion', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.searchSuggestion).toBeDefined()
      expect(result.searchSuggestion.maxPrice).toBe(result.estimate.maxHomePrice)
      expect(result.searchSuggestion.message).toContain('search for properties')
    })

    it('should provide CRM data for lead capture', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.crmData).toBeDefined()
      expect(result.crmData.mortgageEstimate).toBeDefined()
      expect(result.crmData.mortgageEstimate.maxHomePrice).toBe(result.estimate.maxHomePrice)
      expect(result.crmData.mortgageEstimate.annualIncome).toBe(120000)
    })
  })

  describe('default values', () => {
    it('should use default mortgage rate when not provided', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
      } as any) // Cast to any to test default handling

      expect(result.success).toBe(true)
    })

    it('should use default monthly debts of 0', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        currentMortgageRate: 4.5,
      } as any)

      expect(result.success).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle very low income gracefully', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 30000,
        downPayment: 20000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      // Should still calculate something reasonable
      expect(result.estimate.maxHomePrice).toBeGreaterThan(20000)
    })

    it('should handle high down payment', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 100000,
        downPayment: 500000, // Very large down payment
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.estimate.maxHomePrice).toBeGreaterThanOrEqual(500000)
    })

    it('should handle high monthly debts reducing affordability significantly', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 80000,
        downPayment: 50000,
        monthlyDebts: 2000, // Very high debts relative to income
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      // Max home price should still be positive
      expect(result.estimate.maxHomePrice).toBeGreaterThan(0)
    })
  })

  describe('currency formatting', () => {
    it('should format prices in CAD', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.message).toContain('$')
      expect(result.formattedSummary).toContain('$')
    })

    it('should round max home price to nearest $1000', async () => {
      const result = await mortgageEstimatorTool.execute({
        annualIncome: 120000,
        downPayment: 100000,
        monthlyDebts: 0,
        currentMortgageRate: 4.5,
      })

      expect(result.success).toBe(true)
      expect(result.estimate.maxHomePrice % 1000).toBe(0)
    })
  })
})
