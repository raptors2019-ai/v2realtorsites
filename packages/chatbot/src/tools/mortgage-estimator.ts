import { z } from 'zod'
import type { CoreTool } from 'ai'

const GDS_MAX = 0.39
const TDS_MAX = 0.44
const STRESS_TEST_FLOOR = 5.25
const DEFAULT_PROPERTY_TAX_RATE = 0.012 // 1.2% annually
const DEFAULT_HEATING_MONTHLY = 150

function getPaymentFactor(rate: number, years: number): number {
  const monthlyRate = rate / 100 / 12
  const numPayments = years * 12
  return (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
         (Math.pow(1 + monthlyRate, numPayments) - 1) * 1000
}

function getStressTestRate(contractRate: number): number {
  return Math.max(contractRate + 2, STRESS_TEST_FLOOR)
}

function getCMHCRate(downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) return 0
  if (downPaymentPercent >= 15) return 0.028
  if (downPaymentPercent >= 10) return 0.031
  return 0.04
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const mortgageEstimatorTool: CoreTool = {
  description: `[PURPOSE] Calculate maximum affordable home price based on Canadian GDS/TDS rules.
[WHEN TO USE] When user says they're not pre-approved, asks "what can I afford", or mentions budget uncertainty.
[IMPORTANT] This is an ESTIMATE only - always include the disclaimer. Offer to search properties after showing results.
[OUTPUT] Returns formattedSummary (markdown) and searchSuggestion with maxPrice for follow-up search.`,

  parameters: z.object({
    annualIncome: z.number()
      .describe('Total annual household income before taxes (e.g., 150000 for $150K)'),
    downPayment: z.number()
      .describe('Amount saved for down payment in dollars'),
    monthlyDebts: z.number().optional().default(0)
      .describe('Monthly debt payments (car, loans, credit cards) - default 0'),
    currentMortgageRate: z.number().optional().default(4.5)
      .describe('Current mortgage rate estimate (default 4.5%)'),
  }),

  execute: async ({ annualIncome, downPayment, monthlyDebts = 0, currentMortgageRate = 4.5 }) => {
    console.error('[chatbot.mortgageEstimator.execute]', {
      annualIncome, downPayment, monthlyDebts, currentMortgageRate
    })

    try {
      // Validation
      if (annualIncome <= 0) {
        return {
          success: false,
          message: "Please provide a valid annual income (greater than $0).",
          error: 'Invalid income'
        }
      }

      if (downPayment < 0) {
        return {
          success: false,
          message: "Down payment cannot be negative.",
          error: 'Invalid down payment'
        }
      }

      const monthlyIncome = annualIncome / 12

      // Validate monthly debts - if they're >= monthly income, something is wrong
      if (monthlyDebts >= monthlyIncome) {
        return {
          success: false,
          message: `It looks like your monthly debt payments ($${monthlyDebts.toLocaleString()}/month) are equal to or greater than your monthly income ($${Math.round(monthlyIncome).toLocaleString()}/month). Please verify your debt amount. If this is correct, I'd recommend speaking with one of our agents for personalized advice.`,
          error: 'Monthly debts exceed income'
        }
      }

      // Warn if debts are very high (>50% of income)
      if (monthlyDebts > monthlyIncome * 0.5) {
        console.error('[chatbot.mortgageEstimator.warning]', {
          message: 'High debt-to-income ratio',
          monthlyDebts,
          monthlyIncome,
          ratio: (monthlyDebts / monthlyIncome * 100).toFixed(1) + '%'
        })
      }

      const stressTestRate = getStressTestRate(currentMortgageRate)

      // Calculate max housing cost (GDS)
      const maxHousingGDS = monthlyIncome * GDS_MAX

      // Calculate max housing cost (TDS)
      const maxHousingTDS = (monthlyIncome * TDS_MAX) - monthlyDebts

      // Use the lower of the two
      const maxHousingCost = Math.min(maxHousingGDS, maxHousingTDS)

      // Binary search for max home price
      let low = downPayment
      let high = downPayment + 2000000

      while (high - low > 1000) {
        const mid = (low + high) / 2
        const mortgage = mid - downPayment

        const monthlyTax = (mid * DEFAULT_PROPERTY_TAX_RATE) / 12
        const availableForPI = maxHousingCost - monthlyTax - DEFAULT_HEATING_MONTHLY

        const paymentFactor = getPaymentFactor(stressTestRate, 25)
        const maxMortgageAtPrice = (availableForPI / paymentFactor) * 1000

        if (mortgage <= maxMortgageAtPrice) {
          low = mid
        } else {
          high = mid
        }
      }

      const maxHomePrice = Math.floor(low / 1000) * 1000 // Round to nearest $1000
      const maxMortgage = maxHomePrice - downPayment

      // Calculate actual monthly payment at current rate
      const paymentFactor = getPaymentFactor(currentMortgageRate, 25)
      const monthlyPayment = (maxMortgage / 1000) * paymentFactor

      // Calculate CMHC if applicable
      const downPaymentPercent = (downPayment / maxHomePrice) * 100
      const cmhcRate = getCMHCRate(downPaymentPercent)
      const cmhcPremium = maxMortgage * cmhcRate
      const totalMortgage = maxMortgage + cmhcPremium

      // Calculate property taxes
      const monthlyPropertyTax = (maxHomePrice * DEFAULT_PROPERTY_TAX_RATE) / 12

      const result = {
        success: true,
        displayType: 'mortgage-card', // Signal to render custom card component
        estimate: {
          maxHomePrice,
          mortgageAmount: maxMortgage, // Renamed for consistency with card component
          totalMortgageWithCMHC: cmhcPremium > 0 ? totalMortgage : maxMortgage,
          downPayment,
          downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
          cmhcPremium: cmhcPremium > 0 ? cmhcPremium : null,
          monthlyPayment: Math.round(monthlyPayment),
          monthlyPropertyTax: Math.round(monthlyPropertyTax),
          monthlyHeating: DEFAULT_HEATING_MONTHLY,
          totalMonthlyHousing: Math.round(monthlyPayment + monthlyPropertyTax + DEFAULT_HEATING_MONTHLY),
          stressTestRate,
          gdsRatio: Math.round((maxHousingCost / monthlyIncome) * 100),
          tdsRatio: Math.round(((maxHousingCost + monthlyDebts) / monthlyIncome) * 100),
        },
        message: `Great! Based on your income of ${formatCurrency(annualIncome)} and down payment of ${formatCurrency(downPayment)}, here's your affordability estimate:

I recommend speaking with a mortgage broker for accurate pre-approval. Would you like me to search for properties under ${formatCurrency(maxHomePrice)}?`,
        formattedSummary: `Max Home Price: ${formatCurrency(maxHomePrice)}
Down Payment: ${formatCurrency(downPayment)} (${Math.round(downPaymentPercent)}%)
Mortgage Amount: ${formatCurrency(maxMortgage)}${cmhcPremium > 0 ? `\nCMHC Insurance: ${formatCurrency(cmhcPremium)}` : ''}
Monthly Payment: ${formatCurrency(monthlyPayment)}`,
        searchSuggestion: {
          maxPrice: maxHomePrice,
          message: `Would you like me to search for properties under ${formatCurrency(maxHomePrice)}?`
        },
        // CRM integration data
        crmData: {
          mortgageEstimate: {
            maxHomePrice,
            downPayment,
            monthlyPayment: Math.round(monthlyPayment),
            annualIncome,
          }
        }
      }

      console.error('[chatbot.mortgageEstimator.success]', {
        maxHomePrice: result.estimate.maxHomePrice,
        monthlyPayment: result.estimate.monthlyPayment,
      })

      return result
    } catch (error) {
      console.error('[chatbot.mortgageEstimator.error]', error)
      return {
        success: false,
        message: "I'm having trouble with that calculation. Let me connect you with an agent who can help.",
        error: error instanceof Error ? error.message : 'Calculation error',
        fallbackAction: 'handoff-to-agent'
      }
    }
  }
}
