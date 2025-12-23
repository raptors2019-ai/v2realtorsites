# Value-Added Services

## Monthly Hosting & Maintenance

### What's Included

- **Website Hosting**: Fast, reliable hosting on Vercel's Edge Network
- **SSL Certificate**: Automatic HTTPS security
- **CDN**: Global content delivery for optimal performance
- **Uptime Monitoring**: 24/7 availability monitoring
- **Regular Updates**: Security patches and dependency updates
- **Technical Support**: Bug fixes and issue resolution

### Monthly Rate

- Base hosting fee: [TBD - to be discussed with client]
- Includes analytics dashboard access
- Includes performance monitoring

---

## Analytics Services

### Current Analytics Provided

- **Monthly Reports**:
  - Page views and unique visitors
  - Property listing engagement (views, clicks, inquiries)
  - Lead source tracking
  - User journey analysis
  - Mobile vs desktop usage
  - Geographic breakdown of visitors

### Metrics Tracked

- **Property Performance**:
  - Most viewed listings
  - Time spent on property details
  - Save/favorite actions
  - Contact form submissions per property

- **User Behavior**:
  - Filter usage patterns
  - Search terms and preferences
  - Conversion funnel analysis
  - Drop-off points

- **Lead Generation**:
  - Form submission rates
  - Chatbot interaction analytics
  - Source attribution (organic, direct, referral)

---

## Future Enhancements: Google Analytics 4 Integration

### Planned Features

1. **Enhanced Ecommerce-Style Tracking**
   - Property "impression" tracking
   - Property detail views
   - Lead as "conversion" events
   - Full attribution modeling

2. **Custom Dimensions**
   - Property type tracking
   - Price range segments
   - City/neighborhood analysis
   - Agent attribution

3. **Audience Building**
   - Retargeting audiences
   - Lookalike audience data
   - High-intent user segments

4. **Real-Time Dashboards**
   - Live visitor count
   - Active property viewers
   - Real-time lead notifications

5. **Automated Reporting**
   - Weekly email summaries
   - Monthly detailed reports
   - Quarterly performance reviews

### G4A Event Structure (Planned)

```javascript
// Property view event
gtag('event', 'view_property', {
  property_id: 'MLS123456',
  property_type: 'detached',
  city: 'Toronto',
  price: 1250000,
  bedrooms: 4,
  listing_type: 'sale'
});

// Lead submission event
gtag('event', 'generate_lead', {
  source: 'property_contact_form',
  property_id: 'MLS123456',
  lead_type: 'buyer'
});
```

---

## Implementation Timeline

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Basic page view tracking | Planned |
| 2 | Property engagement events | Planned |
| 3 | Lead conversion tracking | Planned |
| 4 | Custom dashboards | Future |
| 5 | Automated reporting | Future |

---

## Notes

- Analytics implementation requires G4A property setup
- Client will receive view-only access to analytics dashboard
- Monthly reports delivered via email or shared document
- All tracking is GDPR/privacy compliant with consent management
