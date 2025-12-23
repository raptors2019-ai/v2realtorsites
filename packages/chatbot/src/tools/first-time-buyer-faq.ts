import { z } from 'zod'
import type { CoreTool } from 'ai'
import faqData from '../data/first-time-buyer-faq.json'

type FAQKey = keyof typeof faqData

const FAQ_KEYWORDS: Record<FAQKey, string[]> = {
  'home-buying-process': ['process', 'steps', 'how to buy', 'buying process', 'start', 'begin', 'first steps'],
  'closing-costs': ['closing costs', 'fees', 'how much', 'budget for', 'expenses', 'costs', 'additional'],
  'first-time-buyer-incentives': ['incentives', 'rebate', 'programs', 'savings', 'fhsa', 'hbp', 'first time', 'grants', 'help'],
  'pre-approval': ['pre-approval', 'preapproval', 'pre approval', 'approved', 'mortgage approval', 'pre-approved'],
  'down-payment': ['down payment', 'downpayment', 'minimum', 'how much down', 'save for', 'deposit'],
}

function findBestMatch(question: string): FAQKey | null {
  const lowerQuestion = question.toLowerCase()

  let bestMatch: FAQKey | null = null
  let highestScore = 0

  for (const [key, keywords] of Object.entries(FAQ_KEYWORDS)) {
    const score = keywords.filter(kw => lowerQuestion.includes(kw)).length
    if (score > highestScore) {
      highestScore = score
      bestMatch = key as FAQKey
    }
  }

  return highestScore > 0 ? bestMatch : null
}

export const firstTimeBuyerFAQTool: CoreTool = {
  description: `[PURPOSE] Answer common first-time buyer questions with Ontario-specific information.
[WHEN TO USE] Questions about: home buying process, closing costs, rebates/incentives (LTT, FHSA, HBP), pre-approval, down payment requirements.
[IMPORTANT] For questions outside FAQ scope, suggest connecting with an agent. Include disclaimer about seeking professional advice.
[OUTPUT] Returns formatted answer with structured data (steps, costs breakdown, program details).`,

  parameters: z.object({
    question: z.string().describe('The question being asked'),
    topic: z.enum([
      'home-buying-process',
      'closing-costs',
      'first-time-buyer-incentives',
      'pre-approval',
      'down-payment',
      'general'
    ]).optional().describe('Specific topic if known'),
  }),

  execute: async ({ question, topic }) => {
    console.error('[chatbot.firstTimeBuyerFAQ.execute]', { question, topic })

    // Find matching FAQ
    const matchedTopic = topic !== 'general' && topic
      ? topic as FAQKey
      : findBestMatch(question)

    if (!matchedTopic || !faqData[matchedTopic]) {
      return {
        success: false,
        message: `That's a great question! For specific advice on this topic, I'd recommend speaking with one of our agents who can provide personalized guidance. Would you like me to connect you with an agent?`,
        handoffSuggested: true,
        fallbackAction: 'handoff-to-agent'
      }
    }

    const faq = faqData[matchedTopic]

    let formattedResponse = `## ${faq.question}\n\n${faq.answer}\n\n`

    // Add structured content based on topic
    if ('steps' in faq && faq.steps) {
      formattedResponse += '**Steps:**\n'
      faq.steps.forEach((step: string, i: number) => {
        formattedResponse += `${i + 1}. ${step}\n`
      })
    }

    if ('breakdown' in faq && faq.breakdown) {
      formattedResponse += '\n**Cost Breakdown:**\n'
      for (const [key, value] of Object.entries(faq.breakdown)) {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        formattedResponse += `- ${label}: ${value}\n`
      }
    }

    if ('programs' in faq && faq.programs) {
      formattedResponse += '\n**Available Programs:**\n'
      faq.programs.forEach((program: { name: string; benefit: string; eligibility: string }) => {
        formattedResponse += `\n**${program.name}**\n- Benefit: ${program.benefit}\n- Eligibility: ${program.eligibility}\n`
      })
      if ('totalPotentialSavings' in faq) {
        formattedResponse += `\n**Total Potential Savings:** ${faq.totalPotentialSavings}\n`
      }
    }

    if ('benefits' in faq && faq.benefits) {
      formattedResponse += '\n**Benefits:**\n'
      faq.benefits.forEach((benefit: string) => {
        formattedResponse += `- ${benefit}\n`
      })
    }

    if ('requirements' in faq && faq.requirements) {
      formattedResponse += '\n**Requirements:**\n'
      for (const [key, value] of Object.entries(faq.requirements)) {
        formattedResponse += `- ${key}: ${value}\n`
      }
      if ('example' in faq) {
        formattedResponse += `\n*Example: ${faq.example}*\n`
      }
    }

    formattedResponse += '\n---\n*This information is for general guidance. For personalized advice, please consult with our agents or a mortgage professional.*'

    console.error('[chatbot.firstTimeBuyerFAQ.success]', { topic: matchedTopic })

    return {
      success: true,
      topic: matchedTopic,
      message: formattedResponse,
      relatedTopics: Object.keys(faqData).filter(k => k !== matchedTopic).slice(0, 2),
      // CRM integration - mark as first-time buyer
      crmData: {
        firstTimeBuyer: true,
      }
    }
  }
}
