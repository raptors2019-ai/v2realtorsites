import Link from "next/link";
import {
  BentoGrid,
  BentoFeatureCard,
  AnimatedHeroContent,
  AnimatedHeroItem,
  AnimatedHeroButtons,
} from "@repo/ui";
import { getAllProjects } from "@/lib/projects";

// Fallback images for projects without a featured image
const fallbackImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&q=80',
];

export default async function Home() {
  const allProjects = await getAllProjects();
  // Randomly shuffle and pick 2 projects for featured section
  const shuffled = [...allProjects].sort(() => Math.random() - 0.5);
  const featuredProjects = shuffled.slice(0, 2);

  // Helper to get image with fallback
  const getProjectImage = (project: typeof allProjects[0], index: number) => {
    return project.featuredImage || fallbackImages[index % fallbackImages.length];
  };
  return (
    <div className="min-h-screen bg-white dark:bg-secondary">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
        {/* Background Image - Luxury modern home with pool at dusk */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-[pulse_20s_ease-in-out_infinite]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80')",
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
                Exclusive Pre-Construction Access
              </p>
            </AnimatedHeroItem>
            <AnimatedHeroItem index={1} as="h1" className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Your
              <br />
              <span className="font-light italic text-gradient-primary">Dream</span>
              <br />
              New Home
            </AnimatedHeroItem>
            <AnimatedHeroItem index={2} as="p" className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
              Get VIP access to the hottest pre-construction projects across the
              Greater Toronto Area before they hit the public market.
            </AnimatedHeroItem>
            <AnimatedHeroButtons index={3} className="flex flex-wrap gap-4">
              <Link
                href="/builder-projects"
                className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
              >
                View Projects
              </Link>
              <Link
                href="/connect-with-sales?vip=true"
                className="btn-outline-light px-8 py-3.5 rounded-lg text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get VIP Access
              </Link>
            </AnimatedHeroButtons>
          </AnimatedHeroContent>
        </div>
      </section>

      {/* The NewHomeShow Advantage Section */}
      <section className="py-28 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="accent-line mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">
              The NewHomeShow <span className="text-gradient-primary">Advantage</span>
            </h2>
            <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto">
              Your exclusive gateway to pre-construction opportunities across
              Ontario with VIP access and insider pricing
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
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              }
              title="VIP Builder Access"
              description="Get first access to pre-construction developments before they hit the public market. Our direct builder relationships mean better pricing and unit selection."
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
              title="Platinum Pricing"
              description="Access exclusive incentives, capped development fees, and special pricing only available through our preferred agent network with top builders."
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
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              }
              title="Expert Guidance"
              description="Navigate the pre-construction market with confidence. Our team provides expert analysis on builder reputation, location value, and investment potential."
            />
          </BentoGrid>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-28 bg-white dark:bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary uppercase tracking-[0.25em] text-sm mb-3 font-medium">
              Featured
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white">
              Builder Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredProjects.map((project, index) => {
              const statusBadge = project.status === 'selling' ? 'badge-sale' : 'badge-featured';
              const statusText = project.status === 'selling' ? 'Now Selling' : 'Coming Soon';
              const closingQuarter = project.closingDate
                ? `Q${Math.ceil((new Date(project.closingDate).getMonth() + 1) / 3)} ${new Date(project.closingDate).getFullYear()}`
                : 'TBD';
              const projectImage = getProjectImage(project, index);

              return (
                <Link
                  key={project.slug}
                  href={`/builder-projects/${project.slug}`}
                  className="luxury-card-premium rounded-xl overflow-hidden group cursor-pointer"
                >
                  <div className="relative h-72 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url('${projectImage}')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/30 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className={statusBadge}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-secondary dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-text-secondary dark:text-gray-300 text-sm mb-4">
                      {project.productTypes?.map(pt => pt.name).join(' & ')} in {project.city}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold text-lg">
                        From ${project.startingPrice.toLocaleString()}
                      </span>
                      <span className="text-text-muted dark:text-gray-400 text-sm">{closingQuarter}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/builder-projects"
              className="btn-outline-secondary dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-secondary px-8 py-3.5 rounded-lg text-sm inline-block"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-28 bg-gradient-to-b from-cream to-white dark:from-secondary-light dark:to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">
                About NewHomeShow
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
                  NewHomeShow is your exclusive gateway to the best pre-construction
                  developments across Ontario. We&apos;ve built direct relationships with
                  the GTA&apos;s top builders and developers to bring you VIP access to
                  projects before they&apos;re released to the public.
                </p>
                <p className="text-text-secondary dark:text-gray-300 leading-relaxed">
                  Our team of pre-construction specialists helps you navigate the new
                  home market with confidence. From platinum pricing and incentives
                  to expert guidance on builder reputation and investment potential,
                  we&apos;re committed to finding you the perfect new home.
                </p>
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/connect-with-sales?vip=true"
                    className="btn-primary px-6 py-3 rounded-lg text-sm font-medium"
                  >
                    Get VIP Access
                  </Link>
                  <Link
                    href="/builder-projects"
                    className="btn-outline-secondary dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-secondary px-6 py-3 rounded-lg text-sm"
                  >
                    View Projects
                  </Link>
                </div>
              </div>

              <div className="luxury-card-premium rounded-xl p-8">
                <h3 className="text-xl font-semibold text-secondary dark:text-white mb-6">Why Choose Us</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary dark:text-white font-medium mb-1">First Access</h4>
                      <p className="text-text-secondary dark:text-gray-300 text-sm">Preview and purchase before public release</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary dark:text-white font-medium mb-1">Exclusive Pricing</h4>
                      <p className="text-text-secondary dark:text-gray-300 text-sm">Platinum incentives and capped fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary dark:text-white font-medium mb-1">Best Unit Selection</h4>
                      <p className="text-text-secondary dark:text-gray-300 text-sm">Choose your preferred floor plan and exposure</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-secondary dark:text-white font-medium mb-1">Expert Analysis</h4>
                      <p className="text-text-secondary dark:text-gray-300 text-sm">Builder reputation and investment insights</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-28 bg-white dark:bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="accent-line mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">
                Get <span className="text-gradient-primary">VIP Access</span>
              </h2>
              <p className="text-text-secondary dark:text-gray-300 max-w-2xl mx-auto">
                Register now to receive exclusive access to upcoming projects,
                platinum pricing, and first choice on unit selection.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contact Card 1 */}
              <div className="luxury-card-premium rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <h3 className="text-secondary dark:text-white font-medium mb-2">Phone</h3>
                <a href="tel:+14167860431" className="text-primary hover:text-primary-dark transition-colors">
                  +1 (416) 786-0431
                </a>
              </div>

              {/* Contact Card 2 */}
              <div className="luxury-card-premium rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-secondary dark:text-white font-medium mb-2">Email</h3>
                <a href="mailto:info@newhomeshow.ca" className="text-primary hover:text-primary-dark transition-colors break-all text-sm">
                  info@newhomeshow.ca
                </a>
              </div>

              {/* Contact Card 3 */}
              <div className="luxury-card-premium rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-secondary dark:text-white font-medium mb-2">Register</h3>
                <Link href="/connect-with-sales?vip=true" className="text-primary hover:text-primary-dark transition-colors">
                  Get VIP Access
                </Link>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/connect-with-sales"
                className="btn-primary px-8 py-3.5 rounded-lg text-sm font-medium inline-block"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
