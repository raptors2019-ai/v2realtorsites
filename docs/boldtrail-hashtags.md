# BoldTrail Hashtags Reference

Last updated: 2026-01-30

These hashtags exist in BoldTrail and can be used via the API. Hashtags must exist before they can be assigned to contacts.

## Lead Quality
- `hot-lead`
- `warm-lead`
- `cold-lead`

## Lead Type
- `buyer`
- `Seller` (note: capitalized)
- `investor`
- `general`

## Source
- `website`
- `sri-collective`
- `newhomeshow`

## Timeline (Buyer)
- `timeline-asap`
- `timeline-immediate`
- `timeline-1-3-months`
- `timeline-3-6-months`
- `timeline-6-plus-months`
- `timeline-just-exploring`

## Timeline (Seller)
- `seller-timeline-asap`
- `seller-timeline-1-3-months`
- `seller-timeline-3-6-months`
- `seller-timeline-just-exploring`

## Budget
- `budget-under-500k`
- `budget-500k-750k`
- `budget-750k-1m`
- `budget-1m-2m`
- `budget-2m-plus`

## Qualification
- `first-time-buyer`
- `Pre-Approved` (note: capitalized)
- `mortgage-estimated`
- `cmhc-required`

## Property Types
- `detached`
- `semi-detached`
- `townhouse`
- `condo`

## Urgency Factors
- `relocating`
- `lease-ending`
- `growing-family`
- `downsizing`

## Engagement
- `engaged-mortgage-calc`
- `engaged-neighborhoods`
- `engaged-faq`
- `multiple-searches`
- `viewed-3-plus-listings`
- `viewed-5-plus-listings`

## Cities/Areas (GTA)
- `toronto`
- `mississauga`
- `brampton`
- `Vaughan` (note: capitalized)
- `Markham` (note: capitalized)
- `richmond-hill`
- `Aurora` (note: capitalized)
- `Newmarket` (note: capitalized)
- `oakville`
- `burlington`
- `milton`
- `halton-hills`
- `caledon`
- `king-city`
- `east-gwillimbury`
- `whitchurch-stouffville`
- `georgina`
- `uxbridge`
- `scugog`
- `brock`
- `pickering`
- `ajax`
- `whitby`
- `oshawa`
- `clarington`
- `hamilton`
- `stoney-creek`
- `ancaster`
- `dundas`
- `flamborough`
- `glanbrook`
- `grimsby`
- `lincoln`
- `west-lincoln`
- `st-catharines`
- `niagara-falls`
- `niagara-on-the-lake`

## Notes

1. **Case sensitivity**: Some hashtags are capitalized (Seller, Vaughan, Markham, etc.). The API may be case-sensitive.
2. **Hashtags must exist first**: The kvCORE public API cannot create hashtags. They must be created manually in BoldTrail via Marketing > Hashtag Management.
3. **Notes endpoint not available**: The `action-note` endpoint returns 404 in the public API. Use hashtags to capture key lead information.
