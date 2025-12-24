import {
  trackPropertyView,
  trackPropertyListView,
  trackPropertySelect,
  trackPropertySearch,
  trackLeadFormSubmit,
  trackChatbotInteraction,
  trackPhoneClick,
  trackEmailClick,
  trackCtaClick,
  trackFilterChange,
} from '../real-estate-events'
import type { PropertyItem, PropertyListInfo } from '../types'

describe('real-estate-events', () => {
  describe('trackPropertyView', () => {
    it('should track view_item event with property data', () => {
      const property = {
        id: 'prop-123',
        price: 500000,
        address: '123 Main St',
        type: 'detached',
        city: 'Toronto',
        listingType: 'For Sale',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1500,
      }

      trackPropertyView(property)

      expect(window.gtag).toHaveBeenCalledWith('event', 'view_item', {
        currency: 'CAD',
        value: 500000,
        items: [{
          item_id: 'prop-123',
          item_name: '123 Main St',
          item_category: 'detached',
          item_category2: 'For Sale',
          item_category3: 'Toronto',
          price: 500000,
          quantity: 1,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1500,
        }]
      })
    })

    it('should use default listingType if not provided', () => {
      const property = {
        id: 'prop-123',
        price: 300000,
        address: '456 Oak Ave',
        type: 'condo',
      }

      trackPropertyView(property)

      expect(window.gtag).toHaveBeenCalledWith('event', 'view_item', expect.objectContaining({
        items: [expect.objectContaining({
          item_category2: 'For Sale',
        })]
      }))
    })

    it('should not throw if gtag is not available', () => {
      // Remove gtag
      const originalGtag = window.gtag
      // @ts-expect-error - testing undefined gtag
      window.gtag = undefined

      expect(() => {
        trackPropertyView({
          id: 'prop-123',
          price: 500000,
          address: '123 Main St',
          type: 'detached',
        })
      }).not.toThrow()

      // Restore
      window.gtag = originalGtag
    })
  })

  describe('trackPropertyListView', () => {
    it('should track view_item_list event with properties', () => {
      const properties: PropertyItem[] = [
        {
          item_id: 'prop-1',
          item_name: '123 Main St',
          price: 500000,
          index: 0,
        },
        {
          item_id: 'prop-2',
          item_name: '456 Oak Ave',
          price: 600000,
          index: 1,
        },
      ]

      const listInfo: PropertyListInfo = {
        list_id: 'search_results',
        list_name: 'Toronto Properties',
      }

      trackPropertyListView(properties, listInfo)

      expect(window.gtag).toHaveBeenCalledWith('event', 'view_item_list', {
        item_list_id: 'search_results',
        item_list_name: 'Toronto Properties',
        items: expect.arrayContaining([
          expect.objectContaining({
            item_id: 'prop-1',
            quantity: 1,
            index: 0,
          }),
          expect.objectContaining({
            item_id: 'prop-2',
            quantity: 1,
            index: 1,
          }),
        ])
      })
    })

    it('should limit items to 200 (GA4 limit)', () => {
      const properties: PropertyItem[] = Array.from({ length: 250 }, (_, i) => ({
        item_id: `prop-${i}`,
        item_name: `Property ${i}`,
        price: 500000 + i * 1000,
        index: i,
      }))

      const listInfo: PropertyListInfo = {
        list_id: 'search_results',
        list_name: 'All Properties',
      }

      trackPropertyListView(properties, listInfo)

      const call = (window.gtag as jest.Mock).mock.calls[0]
      expect(call[2].items).toHaveLength(200)
    })
  })

  describe('trackPropertySelect', () => {
    it('should track select_item event', () => {
      const property: PropertyItem = {
        item_id: 'prop-123',
        item_name: '123 Main St',
        price: 500000,
      }

      const listInfo: PropertyListInfo = {
        list_id: 'search_results',
        list_name: 'Search Results',
      }

      trackPropertySelect(property, listInfo)

      expect(window.gtag).toHaveBeenCalledWith('event', 'select_item', {
        item_list_id: 'search_results',
        item_list_name: 'Search Results',
        items: [{
          item_id: 'prop-123',
          item_name: '123 Main St',
          price: 500000,
          quantity: 1,
        }]
      })
    })

    it('should use default list info if not provided', () => {
      const property: PropertyItem = {
        item_id: 'prop-123',
        item_name: '123 Main St',
        price: 500000,
      }

      trackPropertySelect(property)

      expect(window.gtag).toHaveBeenCalledWith('event', 'select_item', expect.objectContaining({
        item_list_id: 'property_list',
        item_list_name: 'Properties',
      }))
    })
  })

  describe('trackPropertySearch', () => {
    it('should track search event with term and filters', () => {
      trackPropertySearch('Toronto condos', {
        city: 'Toronto',
        property_type: 'condo',
        min_price: 300000,
        max_price: 500000,
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'Toronto condos',
        city: 'Toronto',
        property_type: 'condo',
        min_price: 300000,
        max_price: 500000,
      })
    })

    it('should track search with just term', () => {
      trackPropertySearch('luxury homes')

      expect(window.gtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'luxury homes',
      })
    })
  })

  describe('trackLeadFormSubmit', () => {
    it('should track generate_lead event with form type', () => {
      trackLeadFormSubmit('contact')

      expect(window.gtag).toHaveBeenCalledWith('event', 'generate_lead', {
        currency: 'CAD',
        value: 0,
        form_type: 'contact',
      })
    })

    it('should include property data if provided', () => {
      const property: PropertyItem = {
        item_id: 'prop-123',
        item_name: '123 Main St',
        price: 500000,
      }

      trackLeadFormSubmit('showing_request', property)

      expect(window.gtag).toHaveBeenCalledWith('event', 'generate_lead', {
        currency: 'CAD',
        value: 500000,
        form_type: 'showing_request',
        items: [expect.objectContaining({
          item_id: 'prop-123',
          price: 500000,
        })]
      })
    })
  })

  describe('trackChatbotInteraction', () => {
    it('should track chatbot_interaction event', () => {
      trackChatbotInteraction('start')

      expect(window.gtag).toHaveBeenCalledWith('event', 'chatbot_interaction', {
        interaction_type: 'start',
      })
    })

    it('should track different interaction types', () => {
      const actions = ['start', 'message', 'lead', 'survey_start', 'survey_complete'] as const

      actions.forEach((action) => {
        jest.clearAllMocks()
        trackChatbotInteraction(action)

        expect(window.gtag).toHaveBeenCalledWith('event', 'chatbot_interaction', {
          interaction_type: action,
        })
      })
    })
  })

  describe('trackPhoneClick', () => {
    it('should track phone_click event', () => {
      trackPhoneClick('416-555-0123', 'property_detail')

      expect(window.gtag).toHaveBeenCalledWith('event', 'phone_click', {
        phone_number: '416-555-0123',
        click_context: 'property_detail',
      })
    })

    it('should use general context if not provided', () => {
      trackPhoneClick('416-555-0123')

      expect(window.gtag).toHaveBeenCalledWith('event', 'phone_click', {
        phone_number: '416-555-0123',
        click_context: 'general',
      })
    })
  })

  describe('trackEmailClick', () => {
    it('should track email_click event', () => {
      trackEmailClick('test@example.com', 'contact_page')

      expect(window.gtag).toHaveBeenCalledWith('event', 'email_click', {
        email_address: 'test@example.com',
        click_context: 'contact_page',
      })
    })

    it('should use general context if not provided', () => {
      trackEmailClick('test@example.com')

      expect(window.gtag).toHaveBeenCalledWith('event', 'email_click', {
        email_address: 'test@example.com',
        click_context: 'general',
      })
    })
  })

  describe('trackCtaClick', () => {
    it('should track cta_click event', () => {
      trackCtaClick('Schedule Viewing', 'property_detail')

      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_click', {
        cta_name: 'Schedule Viewing',
        cta_location: 'property_detail',
      })
    })
  })

  describe('trackFilterChange', () => {
    it('should track filter_properties event', () => {
      trackFilterChange({
        city: 'Toronto',
        property_type: 'condo',
        bedrooms: 2,
        min_price: 300000,
        max_price: 500000,
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'filter_properties', {
        city: 'Toronto',
        property_type: 'condo',
        bedrooms: 2,
        min_price: 300000,
        max_price: 500000,
      })
    })
  })

  describe('error handling', () => {
    it('should not throw when gtag throws an error', () => {
      window.gtag = jest.fn().mockImplementation(() => {
        throw new Error('gtag error')
      })

      expect(() => {
        trackPropertyView({
          id: 'prop-123',
          price: 500000,
          address: '123 Main St',
          type: 'detached',
        })
      }).not.toThrow()
    })
  })
})
