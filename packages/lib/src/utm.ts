/**
 * UTM Parameter Utilities
 * Build URLs with proper UTM tracking parameters for social sharing and campaign tracking
 */

/**
 * UTM parameter configuration
 */
export interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

/**
 * Social platform content types
 */
export type SocialContentType = 'property' | 'listing_page' | 'article' | 'homepage'

/**
 * Build a URL with UTM parameters
 * Handles existing query parameters gracefully
 */
export function buildUtmUrl(baseUrl: string, params: UTMParams): string {
  try {
    const url = new URL(baseUrl)

    // Add UTM parameters
    if (params.utm_source) url.searchParams.set('utm_source', params.utm_source)
    if (params.utm_medium) url.searchParams.set('utm_medium', params.utm_medium)
    if (params.utm_campaign) url.searchParams.set('utm_campaign', params.utm_campaign)
    if (params.utm_content) url.searchParams.set('utm_content', params.utm_content)
    if (params.utm_term) url.searchParams.set('utm_term', params.utm_term)

    return url.toString()
  } catch {
    // If URL parsing fails, return original URL
    return baseUrl
  }
}

/**
 * Platform-specific UTM builders
 * Pre-configured UTM parameters for each social platform
 */
export const utmBuilders = {
  /**
   * Build Instagram share URL
   * For Instagram bio links or link stickers
   */
  instagram: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },

  /**
   * Build Facebook share URL
   */
  facebook: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },

  /**
   * Build Twitter/X share URL
   */
  twitter: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'twitter',
      utm_medium: 'social',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },

  /**
   * Build WhatsApp share URL
   */
  whatsapp: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'whatsapp',
      utm_medium: 'social',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },

  /**
   * Build Email share URL
   */
  email: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'email',
      utm_medium: 'email',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },

  /**
   * Build generic link copy URL (for clipboard)
   */
  copy_link: (url: string, contentType: SocialContentType, contentId?: string): string => {
    return buildUtmUrl(url, {
      utm_source: 'direct',
      utm_medium: 'share',
      utm_campaign: `${contentType}_share`,
      utm_content: contentId,
    })
  },
} as const

/**
 * Get the Facebook sharer URL
 */
export function getFacebookSharerUrl(url: string): string {
  const utmUrl = utmBuilders.facebook(url, 'property')
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(utmUrl)}`
}

/**
 * Get the Twitter/X share URL
 */
export function getTwitterShareUrl(url: string, text?: string): string {
  const utmUrl = utmBuilders.twitter(url, 'property')
  const params = new URLSearchParams({ url: utmUrl })
  if (text) params.set('text', text)
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Get the WhatsApp share URL
 */
export function getWhatsAppShareUrl(url: string, text?: string): string {
  const utmUrl = utmBuilders.whatsapp(url, 'property')
  const message = text ? `${text} ${utmUrl}` : utmUrl
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/**
 * Get the mailto URL for email sharing
 */
export function getEmailShareUrl(url: string, subject: string, body?: string): string {
  const utmUrl = utmBuilders.email(url, 'property')
  const fullBody = body ? `${body}\n\n${utmUrl}` : utmUrl
  const params = new URLSearchParams({ subject, body: fullBody })
  return `mailto:?${params.toString()}`
}
