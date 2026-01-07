'use client'

import { trackPhoneClick, trackEmailClick } from '@repo/analytics'

interface Agent {
  name: string
  title: string
  phone: string
  email: string
  image?: string
}

interface ContactPageClientProps {
  agents: Agent[]
}

export function ContactPageClient({ agents }: ContactPageClientProps) {
  const handlePhoneClick = (phone: string) => {
    trackPhoneClick(phone, 'contact_page')
  }

  const handleEmailClick = (email: string) => {
    trackEmailClick(email, 'contact_page')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-secondary mb-6">Meet Your Agents</h2>
      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="luxury-card-premium rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              {agent.image && (
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-20 h-20 rounded-full object-cover object-top border-3 border-primary/30 shadow-lg"
                />
              )}
              <div>
                <h3 className="font-semibold text-secondary text-lg">{agent.name}</h3>
                <p className="text-primary text-sm">{agent.title}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a
                href={`tel:${agent.phone.replace(/\s/g, '')}`}
                onClick={() => handlePhoneClick(agent.phone)}
                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span className="text-sm">{agent.phone}</span>
              </a>
              <a
                href={`mailto:${agent.email}`}
                onClick={() => handleEmailClick(agent.email)}
                className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <span className="text-sm break-all">{agent.email}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
