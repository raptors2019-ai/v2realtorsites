import type { LeadEmailData } from './types'

const QUALITY_COLORS: Record<string, string> = {
  hot: '#DC2626',
  warm: '#F59E0B',
  cold: '#6B7280',
}

const SOURCE_LABELS: Record<string, string> = {
  'newhomeshow': 'NewHomeShow',
  'sri-collective': 'Sri Collective',
}

const LEAD_SOURCE_LABELS: Record<string, string> = {
  'contact-form': 'Contact Form',
  'registration': 'Registration',
  'chatbot': 'Chatbot',
  'property-inquiry': 'Property Inquiry',
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-CA')}`
}

function buildSubject(data: LeadEmailData): string {
  const qualityBadge = data.leadQuality === 'hot' ? '[HOT LEAD] '
    : data.leadQuality === 'warm' ? '[WARM LEAD] '
    : ''
  const name = `${data.firstName} ${data.lastName}`.trim()
  const type = data.leadType.charAt(0).toUpperCase() + data.leadType.slice(1)
  const source = SOURCE_LABELS[data.source] || data.source
  return `${qualityBadge}${name} — ${type} from ${source}`
}

function section(title: string, content: string): string {
  return `
    <tr>
      <td style="padding: 16px 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #374151; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">${title}</h2>
        ${content}
      </td>
    </tr>`
}

function row(label: string, value: string): string {
  return `<p style="margin: 4px 0; font-size: 14px; color: #4B5563;"><strong style="color: #111827;">${label}:</strong> ${escapeHtml(value)}</p>`
}

export function buildLeadEmailHtml(data: LeadEmailData): { subject: string; html: string } {
  const subject = buildSubject(data)
  const timestamp = new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })
  const qualityColor = data.leadQuality ? QUALITY_COLORS[data.leadQuality] || '#6B7280' : '#6B7280'
  const qualityLabel = data.leadQuality ? data.leadQuality.toUpperCase() : 'NEW'
  const sourceLabel = SOURCE_LABELS[data.source] || data.source
  const leadSourceLabel = LEAD_SOURCE_LABELS[data.leadSource] || data.leadSource

  const sections: string[] = []

  // --- Contact Info (always shown) ---
  const contactRows: string[] = []
  contactRows.push(row('Name', `${data.firstName} ${data.lastName}`))
  if (data.email) contactRows.push(row('Email', data.email))
  if (data.phone) contactRows.push(row('Phone', data.phone))
  sections.push(section('Contact Information', contactRows.join('')))

  // --- Message ---
  if (data.message) {
    sections.push(section('Message', `
      <div style="background: #F9FAFB; border-left: 3px solid #3B82F6; padding: 12px 16px; margin: 4px 0; font-size: 14px; color: #374151; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
    `))
  }

  // --- Conversation Summary (chatbot) ---
  if (data.conversationSummary) {
    sections.push(section('Conversation Summary', `
      <div style="background: #EFF6FF; border-left: 3px solid #2563EB; padding: 12px 16px; margin: 4px 0; font-size: 14px; color: #1E40AF; white-space: pre-wrap;">${escapeHtml(data.conversationSummary)}</div>
    `))
  }

  // --- Preferences ---
  const prefRows: string[] = []
  if (data.budget) prefRows.push(row('Budget', data.budget))
  if (data.timeline) prefRows.push(row('Timeline', data.timeline))
  if (data.locations?.length) prefRows.push(row('Locations', data.locations.join(', ')))
  if (data.propertyTypes?.length) prefRows.push(row('Property Types', data.propertyTypes.join(', ')))
  if (data.bedrooms) prefRows.push(row('Bedrooms', String(data.bedrooms)))
  if (data.bathrooms) prefRows.push(row('Bathrooms', String(data.bathrooms)))
  if (prefRows.length > 0) {
    sections.push(section('Preferences', prefRows.join('')))
  }

  // --- Property Info (inquiry/walkthrough) ---
  if (data.propertyAddress || data.propertyMls) {
    const propRows: string[] = []
    if (data.propertyAddress) propRows.push(row('Address', data.propertyAddress))
    if (data.propertyMls) propRows.push(row('MLS#', data.propertyMls))
    if (data.inquiryType) {
      propRows.push(row('Inquiry Type', data.inquiryType === 'viewing' ? 'Walkthrough Request' : 'Question'))
    }
    sections.push(section('Property', propRows.join('')))
  }

  // --- Registration ---
  if (data.projectSlug) {
    sections.push(section('Registration', row('Project', data.projectSlug)))
  }

  // --- Mortgage Estimate ---
  if (data.mortgageEstimate) {
    const m = data.mortgageEstimate
    const mortRows: string[] = []
    mortRows.push(row('Max Purchasing Power', formatCurrency(m.maxPrice)))
    mortRows.push(row('Annual Income', formatCurrency(m.annualIncome)))
    mortRows.push(row('Down Payment', formatCurrency(m.downPayment)))
    if (m.monthlyDebts) mortRows.push(row('Monthly Debts', formatCurrency(m.monthlyDebts)))
    sections.push(section('Mortgage Estimate', mortRows.join('')))
  }

  // --- Viewed Listings ---
  if (data.viewedListings?.length) {
    const listings = data.viewedListings.slice(0, 5)
    const listingItems = listings.map(l =>
      `<li style="margin: 4px 0; font-size: 14px; color: #4B5563;">${escapeHtml(l.address)} — ${formatCurrency(l.price)}</li>`
    ).join('')
    const extra = data.viewedListings.length > 5
      ? `<p style="margin: 4px 0; font-size: 13px; color: #9CA3AF;">+ ${data.viewedListings.length - 5} more</p>`
      : ''
    sections.push(section('Viewed Listings', `<ul style="margin: 4px 0; padding-left: 20px;">${listingItems}</ul>${extra}`))
  }

  // --- Engagement ---
  if (data.engagement) {
    const engRows: string[] = []
    if (data.engagement.toolsUsed.length) engRows.push(row('Tools Used', data.engagement.toolsUsed.join(', ')))
    engRows.push(row('Properties Viewed', String(data.engagement.propertiesViewed)))
    if (data.engagement.conversationTopics.length) engRows.push(row('Topics Discussed', data.engagement.conversationTopics.join(', ')))
    sections.push(section('Engagement', engRows.join('')))
  }

  // --- Qualifications ---
  const qualRows: string[] = []
  if (data.preApproved) qualRows.push(row('Pre-Approved', 'Yes'))
  if (data.firstTimeBuyer) qualRows.push(row('First-Time Buyer', 'Yes'))
  if (data.urgencyFactors?.length) qualRows.push(row('Urgency Factors', data.urgencyFactors.join(', ')))
  if (qualRows.length > 0) {
    sections.push(section('Qualifications', qualRows.join('')))
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #F3F4F6; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: #1E293B; padding: 20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; color: #FFFFFF; background: ${qualityColor}; letter-spacing: 0.5px;">${qualityLabel} LEAD</span>
                  </td>
                  <td align="right" style="font-size: 13px; color: #94A3B8;">
                    ${escapeHtml(sourceLabel)} &bull; ${escapeHtml(leadSourceLabel)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 10px;">
                    <h1 style="margin: 0; font-size: 22px; color: #FFFFFF;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</h1>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 4px;">
                    <span style="font-size: 13px; color: #94A3B8;">${escapeHtml(timestamp)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Sections -->
          ${sections.join('')}
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">This is an automated lead notification from ${escapeHtml(sourceLabel)}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
