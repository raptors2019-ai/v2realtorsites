'use client'

declare global {
  interface Window {
    gtag: Function
  }
}

export const trackPropertyView = (property: {
  id: string
  price: number
  address: string
  type: string
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'CAD',
      value: property.price,
      items: [{
        item_id: property.id,
        item_name: property.address,
        item_category: property.type,
        price: property.price
      }]
    })
  }
}

export const trackLeadFormSubmit = (formType: 'contact' | 'vip' | 'valuation') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'CAD',
      value: 0,
      form_type: formType
    })
  }
}

export const trackChatbotInteraction = (action: 'start' | 'message' | 'lead') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'chatbot_interaction', {
      interaction_type: action
    })
  }
}
