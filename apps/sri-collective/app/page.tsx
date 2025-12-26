import {
  PropertyCard,
  BentoGrid,
  BentoFeatureCard,
  AnimatedHeroContent,
  AnimatedHeroItem,
  AnimatedHeroButtons,
} from "@repo/ui";
import { getFeaturedProperties } from "@/lib/data";
import Link from "next/link";

export default async function Home() {
  const featuredProperties = await getFeaturedProperties(3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-[pulse_20s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&q=80')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <AnimatedHeroContent className="max-w-2xl">
            <AnimatedHeroItem index={0} className="mb-6">
              <div className="accent-line mb-6" />
              <p className="text-primary uppercase tracking-[0.25em] text-sm mb-4 font-medium">
                Your Trusted Real Estate Partners
              </p>
            </AnimatedHeroItem>
            <AnimatedHeroItem index={1} as="h1" className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your
              <br />
              <span className="font-light italic text-gradient-primary">Perfect</span>
              <br />
              Home
            </AnimatedHeroItem>
            <AnimatedHeroItem index={2} as="p" className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
              Browse thousands of listings across the Greater Toronto Area.
              Expert guidance from search to closing and beyond.
            </AnimatedHeroItem>
            <AnimatedHeroButtons index={3} className="flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="px-8 py-4 rounded-lg text-base font-semibold bg-white text-[#1a1a2e] border-2 border-primary hover:bg-primary hover:text-white shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact?interest=selling"
                className="px-8 py-4 rounded-lg text-base font-semibold bg-white text-[#1a1a2e] border-2 border-primary hover:bg-primary hover:text-white shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                Sell Your Home
              </Link>
            </AnimatedHeroButtons>
          </AnimatedHeroContent>

          {/* Search Card */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md p-6 rounded-xl max-w-xs shadow-2xl border-2 border-white">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-xl" />
            <div className="pt-2">
              <h3 className="text-lg font-bold text-secondary mb-4">Find Your Home</h3>
              <p className="text-gray-700 text-sm mb-4 font-medium">
                Tell us what you&apos;re looking for and we&apos;ll help you find the perfect property.
              </p>
              <Link
                href="/properties"
                className="block text-center px-4 py-3 rounded-lg text-sm font-semibold bg-white text-primary border-2 border-primary hover:bg-primary hover:!text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Searching
              </Link>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center font-medium">
                  Or get instant answers via chat
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Sri Collective Advantage Section */}
      <section className="py-28 bg-gradient-to-b from-cream to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="accent-line mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              The Sri Collective <span className="text-gradient-primary">Advantage</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              We bring expertise, personalized service, and a client-first approach
              to every transaction
            </p>
          </div>

          <BentoGrid className="max-w-5xl mx-auto">
            <BentoFeatureCard
              icon={
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              }
              title="Extensive Listings"
              description="Access thousands of MLS listings across the GTA. Our powerful search tools help you find properties that match your exact criteria."
            />

            <BentoFeatureCard
              icon={
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              }
              title="Market Expertise"
              description="Deep knowledge of GTA neighborhoods and market trends. We help you make informed decisions whether buying or selling."
            />

            <BentoFeatureCard
              icon={
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              }
              title="White Glove Service"
              description="Sri and Niru personally handle every aspect of your transaction. From your first call to closing day, you'll receive dedicated, one-on-one support."
            />
          </BentoGrid>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.25em] text-sm mb-3 font-medium">
              Explore
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary">
              Featured Properties
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/properties"
              className="btn-outline px-8 py-3.5 rounded-lg text-sm inline-block"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Sell Your Home Section */}
      <section className="py-28 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="accent-line mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  Thinking of <span className="text-gradient-primary">Selling?</span>
                </h2>
                <p className="text-text-secondary leading-relaxed mb-6">
                  Get a free, no-obligation home valuation from our team. We&apos;ll
                  analyze recent sales in your neighborhood, current market conditions,
                  and your home&apos;s unique features to provide an accurate estimate.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Free home valuation
                  </li>
                  <li className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Professional photography & staging advice
                  </li>
                  <li className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Maximum exposure marketing
                  </li>
                  <li className="flex items-center gap-3 text-text-secondary">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Expert negotiation support
                  </li>
                </ul>
                <Link
                  href="/contact?interest=valuation"
                  className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
                >
                  Get Your Free Valuation
                </Link>
              </div>

              <div className="relative">
                <div
                  className="aspect-[4/3] rounded-xl bg-cover bg-center shadow-xl"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop')",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                About Sri Collective Group
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-text-secondary leading-relaxed">
                  Sri Collective Group brings together the expertise of Sri Kathiravelu
                  and Niru Arulselvan, two of Ontario&apos;s most trusted real estate professionals.
                  With years of experience serving buyers and sellers across the Greater Toronto Area,
                  we&apos;ve built a reputation for exceptional service and results.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Our digital-first approach combines cutting-edge technology with personalized
                  service, ensuring you have the tools and support needed to make confident
                  real estate decisions. Whether you&apos;re a first-time buyer or looking to sell,
                  we&apos;re committed to exceeding your expectations.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/contact"
                    className="btn-primary px-6 py-3 rounded-lg text-sm font-medium"
                  >
                    Get in Touch
                  </Link>
                  <Link
                    href="/about"
                    className="btn-outline px-6 py-3 rounded-lg text-sm"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              <div className="luxury-card-premium rounded-xl p-8">
                <h3 className="text-xl font-semibold text-secondary mb-6">Why Choose Us</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary font-medium mb-1">Local Expertise</h4>
                      <p className="text-text-secondary text-sm">Deep knowledge of GTA neighborhoods</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary font-medium mb-1">Proven Results</h4>
                      <p className="text-text-secondary text-sm">Track record of successful transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary font-medium mb-1">White-Glove Service</h4>
                      <p className="text-text-secondary text-sm">Personalized support from search to closing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary font-medium mb-1">Modern Technology</h4>
                      <p className="text-text-secondary text-sm">Helpful tools to support your home search</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-28 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Let&apos;s Work <span className="text-gradient-primary">Together</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Whether you&apos;re looking to buy your dream home or sell your property,
                we&apos;re here to guide you every step of the way.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contact Card 1 */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <h3 className="text-secondary font-medium mb-2">Phone</h3>
                <a href="tel:+14167860431" className="text-primary hover:text-primary/80 transition-colors">
                  +1 (416) 786-0431
                </a>
              </div>

              {/* Contact Card 2 */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-secondary font-medium mb-2">Email</h3>
                <a href="mailto:info@sricollectivegroup.com" className="text-primary hover:text-primary/80 transition-colors break-all text-sm">
                  info@sricollectivegroup.com
                </a>
              </div>

              {/* Contact Card 3 */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center group hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-secondary font-medium mb-2">Schedule</h3>
                <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">
                  Book Consultation
                </Link>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/contact"
                className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
              >
                Contact Us Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
