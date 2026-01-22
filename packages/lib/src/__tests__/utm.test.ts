import {
  buildUtmUrl,
  utmBuilders,
  getFacebookSharerUrl,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  getEmailShareUrl,
} from '../utm'

describe('UTM Utilities', () => {
  describe('buildUtmUrl', () => {
    it('should add UTM parameters to a URL', () => {
      const result = buildUtmUrl('https://example.com/property/123', {
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'property_share',
      })

      expect(result).toContain('utm_source=instagram')
      expect(result).toContain('utm_medium=social')
      expect(result).toContain('utm_campaign=property_share')
    })

    it('should preserve existing query parameters', () => {
      const result = buildUtmUrl('https://example.com/properties?city=toronto', {
        utm_source: 'facebook',
        utm_medium: 'social',
      })

      expect(result).toContain('city=toronto')
      expect(result).toContain('utm_source=facebook')
    })

    it('should handle optional UTM parameters', () => {
      const result = buildUtmUrl('https://example.com', {
        utm_source: 'email',
        utm_medium: 'email',
        utm_content: 'property-123',
      })

      expect(result).toContain('utm_source=email')
      expect(result).toContain('utm_medium=email')
      expect(result).toContain('utm_content=property-123')
      expect(result).not.toContain('utm_campaign')
    })

    it('should return original URL if parsing fails', () => {
      const invalidUrl = 'not-a-valid-url'
      const result = buildUtmUrl(invalidUrl, {
        utm_source: 'test',
        utm_medium: 'test',
      })

      expect(result).toBe(invalidUrl)
    })

    it('should include utm_term when provided', () => {
      const result = buildUtmUrl('https://example.com', {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_term: 'toronto condos',
      })

      expect(result).toContain('utm_term=toronto+condos')
    })
  })

  describe('utmBuilders', () => {
    const baseUrl = 'https://sricollective.ca/properties/toronto/123'

    describe('instagram', () => {
      it('should build Instagram UTM URL', () => {
        const result = utmBuilders.instagram(baseUrl, 'property', 'prop-123')

        expect(result).toContain('utm_source=instagram')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_campaign=property_share')
        expect(result).toContain('utm_content=prop-123')
      })

      it('should work without content ID', () => {
        const result = utmBuilders.instagram(baseUrl, 'listing_page')

        expect(result).toContain('utm_source=instagram')
        expect(result).toContain('utm_campaign=listing_page_share')
      })
    })

    describe('facebook', () => {
      it('should build Facebook UTM URL', () => {
        const result = utmBuilders.facebook(baseUrl, 'property', 'prop-123')

        expect(result).toContain('utm_source=facebook')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_campaign=property_share')
      })
    })

    describe('twitter', () => {
      it('should build Twitter UTM URL', () => {
        const result = utmBuilders.twitter(baseUrl, 'article')

        expect(result).toContain('utm_source=twitter')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_campaign=article_share')
      })
    })

    describe('whatsapp', () => {
      it('should build WhatsApp UTM URL', () => {
        const result = utmBuilders.whatsapp(baseUrl, 'property')

        expect(result).toContain('utm_source=whatsapp')
        expect(result).toContain('utm_medium=social')
        expect(result).toContain('utm_campaign=property_share')
      })
    })

    describe('email', () => {
      it('should build Email UTM URL with email medium', () => {
        const result = utmBuilders.email(baseUrl, 'property')

        expect(result).toContain('utm_source=email')
        expect(result).toContain('utm_medium=email')
        expect(result).toContain('utm_campaign=property_share')
      })
    })

    describe('copy_link', () => {
      it('should build copy link UTM URL', () => {
        const result = utmBuilders.copy_link(baseUrl, 'property', 'prop-123')

        expect(result).toContain('utm_source=direct')
        expect(result).toContain('utm_medium=share')
        expect(result).toContain('utm_campaign=property_share')
      })
    })
  })

  describe('Social Share URLs', () => {
    const propertyUrl = 'https://sricollective.ca/properties/toronto/123'

    describe('getFacebookSharerUrl', () => {
      it('should return Facebook sharer URL with encoded UTM URL', () => {
        const result = getFacebookSharerUrl(propertyUrl)

        expect(result).toMatch(/^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=/)
        expect(result).toContain(encodeURIComponent('utm_source=facebook'))
      })
    })

    describe('getTwitterShareUrl', () => {
      it('should return Twitter share URL', () => {
        const result = getTwitterShareUrl(propertyUrl)

        expect(result).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?/)
        expect(result).toContain('url=')
      })

      it('should include text when provided', () => {
        const result = getTwitterShareUrl(propertyUrl, 'Check out this property!')

        expect(result).toContain('text=Check+out+this+property')
      })
    })

    describe('getWhatsAppShareUrl', () => {
      it('should return WhatsApp share URL', () => {
        const result = getWhatsAppShareUrl(propertyUrl)

        expect(result).toMatch(/^https:\/\/wa\.me\/\?text=/)
      })

      it('should include text message when provided', () => {
        const result = getWhatsAppShareUrl(propertyUrl, 'Check this out:')

        expect(result).toContain(encodeURIComponent('Check this out:'))
      })
    })

    describe('getEmailShareUrl', () => {
      it('should return mailto URL with subject', () => {
        const result = getEmailShareUrl(propertyUrl, 'Beautiful Property in Toronto')

        expect(result).toMatch(/^mailto:\?/)
        expect(result).toContain('subject=Beautiful+Property+in+Toronto')
      })

      it('should include body text when provided', () => {
        const result = getEmailShareUrl(
          propertyUrl,
          'Property Listing',
          'I thought you might like this property.'
        )

        expect(result).toContain('subject=Property+Listing')
        // URLSearchParams encodes spaces as + instead of %20
        expect(result).toContain('I+thought+you+might+like+this+property.')
      })
    })
  })
})
