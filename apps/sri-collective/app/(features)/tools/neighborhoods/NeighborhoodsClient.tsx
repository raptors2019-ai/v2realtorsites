'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Import neighborhoods data - we'll need to make this available
const neighborhoodsData: Record<string, CityData> = {
  Toronto: {
    avgPrice: '$1,100,000',
    priceRange: { min: 450000, max: 3000000 },
    vibe: 'Urban core with diverse neighborhoods from trendy to family-friendly',
    transit: {
      goStations: ['Union Station (hub)', 'Exhibition', 'Danforth', 'Scarborough'],
      ttc: 'Full subway, streetcar, bus network',
      commuteToUnion: '0-45 min depending on neighborhood',
    },
    schools: ['Toronto District School Board', 'Toronto Catholic DSB'],
    topSchools: ['University of Toronto Schools', 'Northern SS', 'Earl Haig SS'],
    recreation: ['High Park', 'Toronto Islands', 'Harbourfront Centre', '30+ community centres'],
    attractions: ['CN Tower', 'Eaton Centre', 'Distillery District', 'St. Lawrence Market'],
    neighborhoods: [
      { name: 'Yorkville', vibe: 'Luxury shopping and dining', avgPrice: '$2,500,000+' },
      { name: 'Leslieville', vibe: 'Trendy cafes and young professionals', avgPrice: '$1,200,000' },
      { name: 'The Beaches', vibe: 'Beachfront community, family-friendly', avgPrice: '$1,500,000' },
      { name: 'High Park', vibe: 'Green space, families', avgPrice: '$1,300,000' },
      { name: 'North York', vibe: 'Suburban feel with urban amenities', avgPrice: '$900,000' },
    ],
  },
  Mississauga: {
    avgPrice: '$1,050,000',
    priceRange: { min: 400000, max: 2500000 },
    vibe: "Canada's 6th largest city, suburban with urban pockets",
    transit: {
      goStations: ['Port Credit', 'Clarkson', 'Cooksville', 'Erindale', 'Streetsville'],
      local: 'MiWay bus, Hurontario LRT',
      commuteToUnion: '25-45 min via GO',
    },
    schools: ['Peel District School Board', 'Dufferin-Peel Catholic DSB'],
    topSchools: ['John Fraser SS', 'Glenforest SS', 'Applewood Heights SS'],
    recreation: ['Credit Valley Golf', 'Living Arts Centre', 'Riverwood Conservancy'],
    attractions: ['Square One Shopping Centre', 'Port Credit waterfront', 'Celebration Square'],
    neighborhoods: [
      { name: 'Port Credit', vibe: 'Waterfront village feel, restaurants', avgPrice: '$1,400,000' },
      { name: 'Streetsville', vibe: 'Historic village, community events', avgPrice: '$1,200,000' },
      { name: 'Erin Mills', vibe: 'Family-friendly, good schools', avgPrice: '$1,100,000' },
      { name: 'Lorne Park', vibe: 'Affluent, ravine lots', avgPrice: '$2,000,000' },
      { name: 'City Centre', vibe: 'Urban condos, walkable', avgPrice: '$600,000' },
    ],
  },
  Vaughan: {
    avgPrice: '$1,250,000',
    priceRange: { min: 600000, max: 3000000 },
    vibe: 'Affluent suburbs with TTC subway access',
    transit: {
      goStations: ['Rutherford', 'Maple'],
      ttc: 'Line 1 extension to VMC',
      commuteToUnion: '40-55 min via subway/GO',
    },
    schools: ['York Region DSB', 'York Catholic DSB'],
    topSchools: ['Vaughan SS', 'Thornhill SS', 'Maple HS'],
    recreation: ['Boyd Conservation Area', 'Kortright Centre', 'Vaughan Mills area'],
    attractions: ["Canada's Wonderland", 'Vaughan Mills mall', 'Kleinburg village'],
    neighborhoods: [
      { name: 'Thornhill', vibe: 'Established, excellent schools', avgPrice: '$1,400,000' },
      { name: 'Woodbridge', vibe: 'Italian heritage, restaurants', avgPrice: '$1,300,000' },
      { name: 'Maple', vibe: 'Historic main street, growing', avgPrice: '$1,200,000' },
      { name: 'Kleinburg', vibe: 'Village feel, McMichael Gallery', avgPrice: '$2,000,000' },
      { name: 'Vaughan Metropolitan Centre', vibe: 'New urban core, condos', avgPrice: '$700,000' },
    ],
  },
  Markham: {
    avgPrice: '$1,300,000',
    priceRange: { min: 600000, max: 3500000 },
    vibe: 'Tech hub, multicultural, excellent schools',
    transit: {
      goStations: ['Markham', 'Unionville', 'Centennial'],
      local: 'York Region Transit, Viva rapid',
      commuteToUnion: '45-60 min via GO',
    },
    schools: ['York Region DSB', 'York Catholic DSB'],
    topSchools: ['Markville SS', 'Unionville HS', 'Pierre Elliott Trudeau HS'],
    recreation: ['Markham Museum', 'Toogood Pond', 'Frederick Chicken Festival'],
    attractions: ['Unionville Main Street', 'Pacific Mall', 'Markville Mall'],
    neighborhoods: [
      { name: 'Unionville', vibe: 'Historic village, boutiques', avgPrice: '$1,800,000' },
      { name: 'Cornell', vibe: 'New urbanism, walkable', avgPrice: '$1,100,000' },
      { name: 'Markham Village', vibe: 'Historic, charming', avgPrice: '$1,200,000' },
      { name: 'Milliken', vibe: 'Diverse, transit-oriented', avgPrice: '$950,000' },
    ],
  },
  'Richmond Hill': {
    avgPrice: '$1,350,000',
    priceRange: { min: 650000, max: 3000000 },
    vibe: 'Family-focused with top schools and green spaces',
    transit: {
      goStations: ['Richmond Hill GO'],
      local: 'York Region Transit, Viva',
      commuteToUnion: '50-65 min via GO',
    },
    schools: ['York Region DSB', 'York Catholic DSB'],
    topSchools: ['Richmond Hill HS', 'Bayview SS'],
    recreation: ['Mill Pond Park', 'Lake Wilcox Park', 'Richmond Green'],
    attractions: ['Historic downtown', 'Hillcrest Mall'],
    neighborhoods: [
      { name: 'Oak Ridges', vibe: 'Nature, conservation areas', avgPrice: '$1,500,000' },
      { name: 'South Richmond Hill', vibe: 'Established, Yonge Street access', avgPrice: '$1,200,000' },
      { name: 'Elgin Mills', vibe: 'Newer developments, families', avgPrice: '$1,400,000' },
    ],
  },
  Oakville: {
    avgPrice: '$1,600,000',
    priceRange: { min: 700000, max: 5000000 },
    vibe: 'Upscale lakeside community with excellent schools',
    transit: {
      goStations: ['Oakville', 'Bronte'],
      local: 'Oakville Transit',
      commuteToUnion: '30-40 min via GO',
    },
    schools: ['Halton DSB', 'Halton Catholic DSB'],
    topSchools: ['Oakville Trafalgar HS', 'Abbey Park HS', 'Iroquois Ridge HS'],
    recreation: ['Bronte Creek Provincial Park', 'Glen Abbey Golf', 'Waterfront Trail'],
    attractions: ['Downtown Oakville shops', 'Bronte Harbour', 'Kerr Village'],
    neighborhoods: [
      { name: 'Old Oakville', vibe: 'Historic, tree-lined streets', avgPrice: '$2,500,000' },
      { name: 'Bronte', vibe: 'Harbour village, seafood', avgPrice: '$1,400,000' },
      { name: 'Glen Abbey', vibe: 'Golf community, families', avgPrice: '$1,800,000' },
      { name: 'Joshua Creek', vibe: 'Newer, diverse', avgPrice: '$1,300,000' },
    ],
  },
  Burlington: {
    avgPrice: '$1,100,000',
    priceRange: { min: 500000, max: 2500000 },
    vibe: 'Lakeside living with small-town charm',
    transit: {
      goStations: ['Burlington', 'Aldershot', 'Appleby'],
      local: 'Burlington Transit',
      commuteToUnion: '45-55 min via GO',
    },
    schools: ['Halton DSB', 'Halton Catholic DSB'],
    topSchools: ['Burlington Central HS', 'Nelson HS', 'M.M. Robinson HS'],
    recreation: ['Spencer Smith Park', 'Royal Botanical Gardens', 'Mount Nemo'],
    attractions: ['Downtown waterfront', 'Village Square', 'Art galleries'],
    neighborhoods: [
      { name: 'Downtown Burlington', vibe: 'Waterfront, restaurants', avgPrice: '$1,200,000' },
      { name: 'Aldershot', vibe: 'Hamilton border, value', avgPrice: '$900,000' },
      { name: 'Tyandaga', vibe: 'Established, ravines', avgPrice: '$1,400,000' },
    ],
  },
  Brampton: {
    avgPrice: '$950,000',
    priceRange: { min: 500000, max: 1800000 },
    vibe: 'Fast-growing, diverse, family-oriented',
    transit: {
      goStations: ['Bramalea', 'Brampton'],
      local: 'Brampton Transit, Zum rapid transit',
      commuteToUnion: '45-60 min via GO',
    },
    schools: ['Peel District School Board', 'Dufferin-Peel Catholic DSB'],
    topSchools: ['Turner Fenton SS', 'Heart Lake SS'],
    recreation: ['Gage Park', 'Heart Lake Conservation', 'CAA Centre'],
    attractions: ['Garden Square', 'Rose Theatre', 'Powerade Centre'],
    neighborhoods: [
      { name: 'Heart Lake', vibe: 'Conservation area, nature lovers', avgPrice: '$1,100,000' },
      { name: 'Mount Pleasant', vibe: 'New development, young families', avgPrice: '$1,000,000' },
      { name: 'Bramalea', vibe: 'Established, diverse', avgPrice: '$850,000' },
      { name: 'Downtown Brampton', vibe: 'Historic, revitalizing', avgPrice: '$800,000' },
    ],
  },
}

interface Neighborhood {
  name: string
  vibe: string
  avgPrice: string
}

interface CityData {
  avgPrice: string
  priceRange: { min: number; max: number }
  vibe: string
  transit: {
    goStations: string[]
    ttc?: string
    local?: string
    commuteToUnion: string
  }
  schools: string[]
  topSchools: string[]
  recreation: string[]
  attractions: string[]
  neighborhoods: Neighborhood[]
}

const cities = Object.keys(neighborhoodsData)

export function NeighborhoodsClient() {
  const searchParams = useSearchParams()
  const [selectedCity, setSelectedCity] = useState<string | null>(
    searchParams.get('city') || null
  )

  useEffect(() => {
    const cityParam = searchParams.get('city')
    if (cityParam && cities.includes(cityParam)) {
      setSelectedCity(cityParam)
    }
  }, [searchParams])

  const cityData = selectedCity ? neighborhoodsData[selectedCity] : null

  return (
    <div className="space-y-8">
      {/* City Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city === selectedCity ? null : city)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedCity === city
                ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <h3 className={`font-semibold ${selectedCity === city ? 'text-emerald-700' : 'text-slate-900'}`}>
              {city}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{neighborhoodsData[city].avgPrice}</p>
          </button>
        ))}
      </div>

      {/* City Details */}
      <AnimatePresence mode="wait">
        {cityData && selectedCity && (
          <motion.div
            key={selectedCity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* City Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">{selectedCity}</h2>
              <p className="text-emerald-100 text-lg mb-4">{cityData.vibe}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <p className="text-sm text-emerald-100">Average Price</p>
                  <p className="text-xl font-bold">{cityData.avgPrice}</p>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <p className="text-sm text-emerald-100">Commute to Union</p>
                  <p className="text-xl font-bold">{cityData.transit.commuteToUnion}</p>
                </div>
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transit */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Transit</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">GO Stations</p>
                    <p className="text-sm text-slate-600">{cityData.transit.goStations.join(', ')}</p>
                  </div>
                  {cityData.transit.ttc && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">TTC</p>
                      <p className="text-sm text-slate-600">{cityData.transit.ttc}</p>
                    </div>
                  )}
                  {cityData.transit.local && (
                    <div>
                      <p className="text-sm font-medium text-slate-700">Local Transit</p>
                      <p className="text-sm text-slate-600">{cityData.transit.local}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Schools */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Schools</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">School Boards</p>
                    <p className="text-sm text-slate-600">{cityData.schools.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Top Schools</p>
                    <p className="text-sm text-slate-600">{cityData.topSchools.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Recreation */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Recreation</h3>
                </div>
                <p className="text-sm text-slate-600">{cityData.recreation.join(', ')}</p>
              </div>

              {/* Attractions */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Attractions</h3>
                </div>
                <p className="text-sm text-slate-600">{cityData.attractions.join(', ')}</p>
              </div>
            </div>

            {/* Neighborhoods */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Neighborhoods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityData.neighborhoods.map((neighborhood) => (
                  <div
                    key={neighborhood.name}
                    className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900">{neighborhood.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{neighborhood.vibe}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-2">{neighborhood.avgPrice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Find Homes in {selectedCity}</h3>
                <p className="text-slate-600">Browse available properties in this area</p>
              </div>
              <Link
                href={`/properties?cities=${encodeURIComponent(selectedCity)}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
              >
                Search {selectedCity} Properties
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Selection State */}
      {!selectedCity && (
        <div className="text-center py-12 text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-lg">Select a city above to explore neighborhoods</p>
        </div>
      )}
    </div>
  )
}
