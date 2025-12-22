export interface Contact {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  message?: string
  source: 'newhomeshow' | 'sri-collective'
  leadType: 'buyer' | 'seller' | 'investor' | 'general'
  timestamp: Date
}
